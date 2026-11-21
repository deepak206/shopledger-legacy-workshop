'use strict';

var assert = require('node:assert/strict');
var test = require('node:test');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');
var reports = require('../lib/reports');

function makeStoredOrder(items, coupon, id) {
  var billed = pricing.computeTotals(items, coupon);
  return {
    id: id || 1,
    date: '21/11/2026',
    customer: 'In-memory customer',
    paymentMode: 'cash',
    status: 'completed',
    items: items,
    coupon: coupon || '',
    subtotal: billed.subtotal,
    discount: billed.discount,
    tax: billed.tax,
    total: billed.total
  };
}

test('invoice matches billed HSN GST rate and amount', function () {
  var items = [{ id: 1, sku: 'GRN-001', name: 'Rice', hsn: '1006', price: 100, qty: 1 }];
  var order = makeStoredOrder(items, '');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.deepEqual(
    { subtotal: order.subtotal, tax: order.tax, total: order.total },
    { subtotal: 100, tax: 5, total: 105 }
  );
  assert.deepEqual(
    {
      invoiceRate: invoiceFigures.rows[0].gstPercent,
      invoiceTax: invoiceFigures.tax,
      invoiceCgst: invoiceFigures.cgst,
      invoiceSgst: invoiceFigures.sgst,
      invoiceTotal: invoiceFigures.total
    },
    { invoiceRate: 5, invoiceTax: 5, invoiceCgst: 2.5, invoiceSgst: 2.5, invoiceTotal: 105 }
  );
  var html = invoice.render(order);
  assert.ok(html.includes('5%'));
  assert.ok(html.includes('₹5.00'));
  assert.ok(html.includes('₹105.00'));
  assert.ok(!html.includes('Accountant Reconciliation Notice'));
});

test('SAVE10 invoice totals match billed capped discount and post-discount GST', function () {
  var items = [{ id: 2, sku: 'GRN-002', name: 'Dal', hsn: '1006', price: 1000, qty: 3 }];
  var order = makeStoredOrder(items, 'SAVE10');
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.deepEqual(
    { subtotal: order.subtotal, discount: order.discount, tax: order.tax, total: order.total },
    { subtotal: 3000, discount: 150, tax: 142.5, total: 2992.5 }
  );
  assert.deepEqual(
    {
      invoiceDiscount: invoiceFigures.discount,
      invoiceTax: invoiceFigures.tax,
      invoiceCgst: invoiceFigures.cgst,
      invoiceSgst: invoiceFigures.sgst,
      invoiceTotal: invoiceFigures.total
    },
    { invoiceDiscount: 150, invoiceTax: 142.5, invoiceCgst: 71.25, invoiceSgst: 71.25, invoiceTotal: 2992.5 }
  );
});

test('GST reconciliation reports no mismatch when invoice matches billed totals', function () {
  var order = makeStoredOrder([
    { id: 1, sku: 'GRN-001', name: 'Rice', hsn: '1006', price: 100, qty: 1 }
  ], '', 1001);
  var result = reports.getGstReconciliation({ orders: [order] });

  assert.equal(result.totalChecked, 1);
  assert.equal(result.mismatchCount, 0);
  assert.equal(result.totalDelta, 0);
  assert.deepEqual(
    {
      ledgerTax: result.rows[0].ledgerTax,
      invoiceTax: result.rows[0].invoiceTax,
      ledgerTotal: result.rows[0].ledgerTotal,
      invoiceTotal: result.rows[0].invoiceTotal,
      delta: result.rows[0].delta,
      matched: result.rows[0].matched
    },
    { ledgerTax: 5, invoiceTax: 5, ledgerTotal: 105, invoiceTotal: 105, delta: 0, matched: true }
  );
});
