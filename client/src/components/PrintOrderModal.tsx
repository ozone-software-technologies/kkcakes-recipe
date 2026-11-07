'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/services/api';

export interface Recipe {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

export interface OrderItem {
    recipe: Recipe | string;
    quantity: number;
    price: number;
}

export interface Order {
    _id: string;
    customerName: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
    orderName?: string;
    contactNumber?: string;
    orderDate?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    orderType?: string;
    pickupLocation?: string;
    deliveryAddress?: string;
    flavour?: string;
    sizeWeight?: string;
    shape?: string;
    tiers?: string;
    frostingFilling?: string;
    colorTheme?: string;
    cakePhoto?: string;
    messageOnCake?: string;
    messageOnBoard?: string;
    nameAgeNumber?: string;
    additionalDecorations?: string;
    specialInstructions?: string;
}

interface PrintOrderModalProps {
    order: Order | null;
    onClose: () => void;
    onOrderUpdated?: () => void;
}

export default function PrintOrderModal({ order, onClose, onOrderUpdated }: PrintOrderModalProps) {
    if (!order) return null;

    // First recipe / cake reference if available
    const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
    const firstRecipe = firstItem && typeof firstItem.recipe === 'object' ? (firstItem.recipe as Recipe) : null;

    const initialFormattedDate = order.orderDate || (order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }) : '');

    const initialOrderName = order.orderName || (order._id ? `#KK-${order._id.substring(order._id.length - 6).toUpperCase()}` : '');

    // Form states
    const [orderName, setOrderName] = useState(initialOrderName);
    const [customerName, setCustomerName] = useState(order.customerName || '');
    const [contactNumber, setContactNumber] = useState(order.contactNumber || '');
    const [orderDate, setOrderDate] = useState(initialFormattedDate);

    // Delivery / Pickup Details
    const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate || '');
    const [deliveryTime, setDeliveryTime] = useState(order.deliveryTime || '');
    const [orderType, setOrderType] = useState<'Delivery' | 'Pickup' | ''>(
        (order.orderType as any) || 'Pickup'
    );
    const [pickupLocation, setPickupLocation] = useState<'Al Mamzar' | 'Century Mall' | string>(
        order.pickupLocation || 'Al Mamzar'
    );
    const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress || '');

    // Cake Details
    const [flavour, setFlavour] = useState(order.flavour || firstRecipe?.name || '');
    const [sizeWeight, setSizeWeight] = useState(order.sizeWeight || '1 kg');
    const [shape, setShape] = useState(order.shape || 'Round');
    const [tiers, setTiers] = useState(order.tiers || '1');
    const [frostingFilling, setFrostingFilling] = useState(order.frostingFilling || '');
    const [colorTheme, setColorTheme] = useState(order.colorTheme || '');
    const [cakePhoto, setCakePhoto] = useState(order.cakePhoto || firstRecipe?.image || '');

    // Customisation Details
    const [messageOnCake, setMessageOnCake] = useState(order.messageOnCake || '');
    const [messageOnBoard, setMessageOnBoard] = useState(order.messageOnBoard || '');
    const [nameAgeNumber, setNameAgeNumber] = useState(order.nameAgeNumber || '');
    const [additionalDecorations, setAdditionalDecorations] = useState(order.additionalDecorations || '');
    const [specialInstructions, setSpecialInstructions] = useState(order.specialInstructions || '');

    // Modal view states
    const [isBlankTemplate, setIsBlankTemplate] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Generate isolated HTML for printing (guarantees no blank pages, exact CSS & A4 sizing)
    const generatePrintHTML = () => {
        const isBlank = isBlankTemplate;
        const vOrderName = isBlank ? '' : (orderName || '');
        const vCustomerName = isBlank ? '' : (customerName || '');
        const vContactNumber = isBlank ? '' : (contactNumber || '');
        const vOrderDate = isBlank ? '' : (orderDate || '');
        const vDeliveryDate = isBlank ? '' : (deliveryDate || '');
        const vDeliveryTime = isBlank ? '' : (deliveryTime || '');
        const vOrderType = isBlank ? '' : orderType;
        const vPickupLocation = isBlank ? '' : pickupLocation;
        const addr = isBlank ? ['', '', ''] : (deliveryAddress ? deliveryAddress.split('\n') : ['', '', '']);
        const vFlavour = isBlank ? '' : (flavour || '');
        const vSizeWeight = isBlank ? '' : (sizeWeight || '');
        const vShape = isBlank ? '' : (shape || '');
        const vTiers = isBlank ? '' : (tiers || '');
        const vFrosting = isBlank ? '' : (frostingFilling || '');
        const vColor = isBlank ? '' : (colorTheme || '');
        const vCakePhoto = isBlank ? '' : (cakePhoto || '');
        const vMsgCake = isBlank ? '' : (messageOnCake || '');
        const vMsgBoard = isBlank ? '' : (messageOnBoard || '');
        const vNameAge = isBlank ? '' : (nameAgeNumber || '');
        const vDecorations = isBlank ? '' : (additionalDecorations || '');
        const instr = isBlank ? ['', '', ''] : (specialInstructions ? specialInstructions.split('\n') : ['', '', '']);

        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cake Order - ${vOrderName || 'Sheet'}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1f2937;
    }
    .sheet {
      width: 100%;
      max-width: 194mm;
      margin: 0 auto;
      background: #ffffff;
      padding-top: 2mm;
    }
    .header-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #FCE2E6;
      border-radius: 16px;
      width: 250px;
      margin: 0 auto 10px auto;
      padding: 6px 20px 4px 20px;
    }
    .header-title {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #7B2439;
      text-transform: uppercase;
      line-height: 1.1;
      margin: 0;
    }
    .header-heart {
      font-size: 10px;
      color: #7B2439;
      line-height: 1;
      margin-top: 2px;
    }
    .box {
      border: 1.5px solid #F2B8C4;
      border-radius: 12px;
      background: #ffffff;
      margin-bottom: 10px;
      overflow: hidden;
    }
    .box-header {
      background-color: #FCE2E6;
      color: #7B2439;
      text-align: center;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border-bottom: 1.5px solid #F2B8C4;
    }
    /* Top Box */
    .top-box-table {
      width: 100%;
      border-collapse: collapse;
    }
    .top-left {
      width: 72%;
      padding: 6px 12px;
      vertical-align: top;
    }
    .top-right {
      width: 28%;
      border-left: 1.5px solid #F2B8C4;
      padding: 6px 12px;
      vertical-align: top;
    }
    .field-row {
      display: flex;
      align-items: flex-end;
      margin-bottom: 6px;
    }
    .field-row:last-child {
      margin-bottom: 0;
    }
    .field-label {
      font-size: 10px;
      font-weight: 700;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      min-width: 140px;
    }
    .field-line {
      flex: 1;
      border-bottom: 1px solid #E8A5B2;
      min-height: 16px;
      padding-left: 8px;
      font-size: 11px;
      color: #111827;
      font-weight: 500;
      line-height: 1.3;
    }
    /* Middle Section 2 Columns */
    .mid-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 10px 0;
      margin-bottom: 10px;
    }
    .mid-col-left {
      width: 50%;
      vertical-align: top;
      padding: 0;
    }
    .mid-col-right {
      width: 50%;
      vertical-align: top;
      padding: 0;
    }
    .photo-frame {
      padding: 8px;
      height: 382px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .photo-inner {
      border: 1px solid #F2B8C4;
      border-radius: 12px;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #ffffff;
    }
    .photo-inner img {
      max-width: 100%;
      max-height: 360px;
      object-fit: contain;
    }
    /* Detail Table */
    .detail-table {
      width: 100%;
      border-collapse: collapse;
    }
    .detail-table tr {
      border-bottom: 1px solid #F2B8C4;
    }
    .detail-table tr:last-child {
      border-bottom: none;
    }
    .detail-label {
      width: 130px;
      font-size: 10px;
      font-weight: 700;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 8px;
      border-right: 1px solid #F2B8C4;
      vertical-align: middle;
    }
    .detail-label-top {
      vertical-align: top;
      padding-top: 6px;
    }
    .detail-value {
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 500;
      color: #111827;
      vertical-align: middle;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }
    .checkbox-box {
      width: 13px;
      height: 13px;
      border: 1px solid #4b5563;
      border-radius: 2px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: #000000;
      line-height: 1;
    }
    .multiline-box {
      padding: 4px 8px;
    }
    .multiline-row {
      border-bottom: 1px solid #E8A5B2;
      min-height: 16px;
      font-size: 11px;
      color: #111827;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .multiline-row:last-child {
      margin-bottom: 0;
    }
    /* Bottom Box */
    .custom-label {
      width: 175px;
      font-size: 10px;
      font-weight: 700;
      color: #1f2937;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 8px;
      border-right: 1px solid #F2B8C4;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header-pill">
      <h1 class="header-title">CAKE ORDER</h1>
      <span class="header-heart">♥</span>
    </div>

    <div class="box">
      <table class="top-box-table">
        <tr>
          <td class="top-left">
            <div class="field-row">
              <span class="field-label">ORDER ID / NAME</span>
              <div class="field-line">${vOrderName}</div>
            </div>
            <div class="field-row">
              <span class="field-label">CUSTOMER NAME</span>
              <div class="field-line">${vCustomerName}</div>
            </div>
            <div class="field-row">
              <span class="field-label">CONTACT NUMBER</span>
              <div class="field-line">${vContactNumber}</div>
            </div>
          </td>
          <td class="top-right">
            <div class="field-label" style="margin-bottom: 4px;">ORDER DATE</div>
            <div class="field-line" style="padding-left: 2px;">${vOrderDate}</div>
          </td>
        </tr>
      </table>
    </div>

    <table class="mid-table">
      <tr>
        <td class="mid-col-left">
          <div class="box" style="margin-bottom: 0;">
            <div class="box-header">CAKE PHOTO / REFERENCE</div>
            <div class="photo-frame">
              <div class="photo-inner">
                ${vCakePhoto ? `<img src="${vCakePhoto}" alt="Cake Reference" />` : ''}
              </div>
            </div>
          </div>
        </td>

        <td class="mid-col-right">
          <div class="box" style="margin-bottom: 10px;">
            <div class="box-header">DELIVERY / PICKUP DETAILS</div>
            <table class="detail-table">
              <tr>
                <td class="detail-label">DATE</td>
                <td class="detail-value">${vDeliveryDate}</td>
              </tr>
              <tr>
                <td class="detail-label">TIME</td>
                <td class="detail-value">${vDeliveryTime}</td>
              </tr>
              <tr>
                <td class="detail-label">ORDER TYPE</td>
                <td class="detail-value">
                  <div class="checkbox-group">
                    <div class="checkbox-item">
                      <span class="checkbox-box">${vOrderType === 'Delivery' ? '✓' : ''}</span>
                      <span>Delivery</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-box">${vOrderType === 'Pickup' ? '✓' : ''}</span>
                      <span>Pickup</span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="detail-label">PICKUP LOCATION</td>
                <td class="detail-value">
                  <div class="checkbox-group">
                    <div class="checkbox-item">
                      <span class="checkbox-box">${vPickupLocation === 'Al Mamzar' ? '✓' : ''}</span>
                      <span>Al Mamzar</span>
                    </div>
                    <div class="checkbox-item">
                      <span class="checkbox-box">${vPickupLocation === 'Century Mall' ? '✓' : ''}</span>
                      <span>Century Mall</span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="detail-label detail-label-top">DELIVERY ADDRESS</td>
                <td class="detail-value" style="padding: 0;">
                  <div class="multiline-box">
                    <div class="multiline-row">${addr[0] || ''}</div>
                    <div class="multiline-row">${addr[1] || ''}</div>
                    <div class="multiline-row">${addr[2] || ''}</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <div class="box" style="margin-bottom: 0;">
            <div class="box-header">CAKE DETAILS</div>
            <table class="detail-table">
              <tr>
                <td class="detail-label">FLAVOUR</td>
                <td class="detail-value">${vFlavour}</td>
              </tr>
              <tr>
                <td class="detail-label">SIZE / WEIGHT</td>
                <td class="detail-value">${vSizeWeight}</td>
              </tr>
              <tr>
                <td class="detail-label">SHAPE</td>
                <td class="detail-value">${vShape}</td>
              </tr>
              <tr>
                <td class="detail-label">TIERS</td>
                <td class="detail-value">${vTiers}</td>
              </tr>
              <tr>
                <td class="detail-label">FROSTING / FILLING</td>
                <td class="detail-value">${vFrosting}</td>
              </tr>
              <tr>
                <td class="detail-label">COLOUR / THEME</td>
                <td class="detail-value">${vColor}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <div class="box" style="margin-bottom: 0;">
      <div class="box-header">CUSTOMISATION DETAILS</div>
      <table class="detail-table">
        <tr>
          <td class="custom-label">MESSAGE ON CAKE</td>
          <td class="detail-value">${vMsgCake}</td>
        </tr>
        <tr>
          <td class="custom-label">MESSAGE ON BOARD</td>
          <td class="detail-value">${vMsgBoard}</td>
        </tr>
        <tr>
          <td class="custom-label">NAME / AGE / NUMBER</td>
          <td class="detail-value">${vNameAge}</td>
        </tr>
        <tr>
          <td class="custom-label">ADDITIONAL DECORATIONS</td>
          <td class="detail-value">${vDecorations}</td>
        </tr>
        <tr>
          <td class="custom-label detail-label-top">SPECIAL INSTRUCTIONS</td>
          <td class="detail-value" style="padding: 0;">
            <div class="multiline-box">
              <div class="multiline-row">${instr[0] || ''}</div>
              <div class="multiline-row">${instr[1] || ''}</div>
              <div class="multiline-row">${instr[2] || ''}</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html>`;
    };

    // Robust print using hidden iframe (immune to parent DOM overflow/modal fixed backdrop bugs)
    const handlePrint = () => {
        try {
            const htmlContent = generatePrintHTML();
            let iframe = document.getElementById('cake-order-print-frame') as HTMLIFrameElement;
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'cake-order-print-frame';
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);
            }

            const doc = iframe.contentWindow?.document;
            if (!doc) {
                window.print();
                return;
            }

            doc.open();
            doc.write(htmlContent);
            doc.close();

            const triggerPrint = () => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            };

            const images = doc.images;
            if (images && images.length > 0) {
                let loadedCount = 0;
                const total = images.length;
                let printTriggered = false;

                const checkAndPrint = () => {
                    if (!printTriggered) {
                        printTriggered = true;
                        setTimeout(triggerPrint, 100);
                    }
                };

                for (let i = 0; i < total; i++) {
                    const img = images[i];
                    if (img.complete) {
                        loadedCount++;
                    } else {
                        img.onload = () => {
                            loadedCount++;
                            if (loadedCount >= total) checkAndPrint();
                        };
                        img.onerror = () => {
                            loadedCount++;
                            if (loadedCount >= total) checkAndPrint();
                        };
                    }
                }
                if (loadedCount >= total) {
                    checkAndPrint();
                } else {
                    setTimeout(checkAndPrint, 800);
                }
            } else {
                setTimeout(triggerPrint, 150);
            }
        } catch (err) {
            console.error('Iframe print error, falling back to window.print():', err);
            window.print();
        }
    };

    const handleSave = async () => {
        if (!order._id) {
            setSaveMessage('Cannot save a blank form template.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        try {
            setIsSaving(true);
            setSaveMessage('');
            const payload = {
                orderName,
                customerName,
                contactNumber,
                orderDate,
                deliveryDate,
                deliveryTime,
                orderType,
                pickupLocation,
                deliveryAddress,
                flavour,
                sizeWeight,
                shape,
                tiers,
                frostingFilling,
                colorTheme,
                cakePhoto,
                messageOnCake,
                messageOnBoard,
                nameAgeNumber,
                additionalDecorations,
                specialInstructions,
            };

            await apiRequest(`/orders/${order._id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            setSaveMessage('Saved successfully!');
            if (onOrderUpdated) {
                onOrderUpdated();
            }
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error: any) {
            console.error('Failed to save order details:', error);
            setSaveMessage(error.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper for multiline address lines (3 lines)
    const addressLines = (isBlankTemplate ? '' : deliveryAddress).split('\n');
    const instructionsLines = (isBlankTemplate ? '' : specialInstructions).split('\n');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Modal Wrapper */}
            <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full p-4 md:p-6 my-auto">

                {/* Top Action Bar */}
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-gray-300 bg-white px-4 py-3 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎂</span>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Cake Order Sheet (A4 Print)</h2>
                            <p className="text-xs text-gray-500">Edit fields directly below or print blank template</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {saveMessage && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${saveMessage.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {saveMessage}
                            </span>
                        )}

                        {/* Blank / Pre-filled Switch */}
                        <button
                            type="button"
                            onClick={() => setIsBlankTemplate(!isBlankTemplate)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                                isBlankTemplate
                                    ? 'bg-purple-100 text-purple-700 border-purple-300'
                                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            {isBlankTemplate ? '📄 Mode: Blank Form' : '📝 Mode: Pre-filled'}
                        </button>

                        {/* Save Changes Button */}
                        {order._id && (
                            <button
                                type="button"
                                disabled={isSaving || isBlankTemplate}
                                onClick={handleSave}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow"
                            >
                                <span>💾</span>
                                <span>{isSaving ? 'Saving...' : 'Save Order'}</span>
                            </button>
                        )}

                        {/* Primary Print Button */}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-transform hover:scale-105 flex items-center gap-1.5 shadow"
                        >
                            <span>🖨️</span>
                            <span>Print (A4)</span>
                        </button>

                        {/* Close Modal */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* On-Screen Preview Container */}
                <div className="flex justify-center overflow-x-auto pb-4">
                    <div
                        className="bg-white text-gray-900 border border-[#F2B8C4] rounded-2xl shadow-md p-6 mx-auto"
                        style={{
                            width: '210mm',
                            minHeight: '280mm',
                            boxSizing: 'border-box',
                            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                    >
                        {/* 1. Header Pill: CAKE ORDER */}
                        <div className="flex justify-center mb-3">
                            <div className="bg-[#FCE2E6] text-[#7B2439] px-14 py-2 rounded-2xl flex flex-col items-center justify-center shadow-xs">
                                <h1 className="text-xl md:text-2xl font-bold tracking-[0.25em] uppercase leading-tight select-none">
                                    CAKE ORDER
                                </h1>
                                <span className="text-xs text-[#7B2439] leading-none mt-0.5">♥</span>
                            </div>
                        </div>

                        {/* 2. Top Info Box */}
                        <div className="border-[1.5px] border-[#F2B8C4] rounded-xl overflow-hidden mb-3 bg-white">
                            <div className="flex flex-col sm:flex-row">
                                {/* Left Side: 3 Rows */}
                                <div className="flex-1 p-2.5 sm:pr-4 space-y-2">
                                    {/* Row 1: Order ID / Name */}
                                    <div className="flex items-center text-xs">
                                        <span className="font-bold text-gray-800 tracking-wider text-[11px] whitespace-nowrap min-w-[140px] uppercase">
                                            ORDER ID / NAME
                                        </span>
                                        <div className="flex-1 border-b border-[#E8A5B2] px-2">
                                            <input
                                                type="text"
                                                value={isBlankTemplate ? '' : orderName}
                                                onChange={(e) => setOrderName(e.target.value)}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Customer Name */}
                                    <div className="flex items-center text-xs">
                                        <span className="font-bold text-gray-800 tracking-wider text-[11px] whitespace-nowrap min-w-[140px] uppercase">
                                            CUSTOMER NAME
                                        </span>
                                        <div className="flex-1 border-b border-[#E8A5B2] px-2">
                                            <input
                                                type="text"
                                                value={isBlankTemplate ? '' : customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Contact Number */}
                                    <div className="flex items-center text-xs">
                                        <span className="font-bold text-gray-800 tracking-wider text-[11px] whitespace-nowrap min-w-[140px] uppercase">
                                            CONTACT NUMBER
                                        </span>
                                        <div className="flex-1 border-b border-[#E8A5B2] px-2">
                                            <input
                                                type="text"
                                                value={isBlankTemplate ? '' : contactNumber}
                                                onChange={(e) => setContactNumber(e.target.value)}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Order Date */}
                                <div className="sm:w-[28%] border-t sm:border-t-0 sm:border-l border-[#F2B8C4] p-2.5 flex flex-col justify-start">
                                    <span className="font-bold text-gray-800 tracking-wider text-[11px] uppercase mb-1">
                                        ORDER DATE
                                    </span>
                                    <div className="border-b border-[#E8A5B2] mt-1 px-1">
                                        <input
                                            type="text"
                                            value={isBlankTemplate ? '' : orderDate}
                                            onChange={(e) => setOrderDate(e.target.value)}
                                            placeholder=""
                                            className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Middle Section: Two Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

                            {/* Left Column: CAKE PHOTO / REFERENCE */}
                            <div className="border-[1.5px] border-[#F2B8C4] rounded-xl overflow-hidden flex flex-col bg-white">
                                <div className="bg-[#FCE2E6] text-[#7B2439] py-1 px-3 border-b border-[#F2B8C4] text-center">
                                    <h3 className="font-bold tracking-[0.15em] text-[11px] uppercase select-none">
                                        CAKE PHOTO / REFERENCE
                                    </h3>
                                </div>
                                <div className="p-2.5 flex-1 flex flex-col">
                                    <div className="border border-[#F2B8C4] rounded-xl flex-1 min-h-[350px] flex flex-col items-center justify-center p-2 bg-white relative overflow-hidden group">
                                        {!isBlankTemplate && cakePhoto ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                <img
                                                    src={cakePhoto}
                                                    alt="Cake Reference"
                                                    className="max-h-[340px] max-w-full object-contain rounded-lg"
                                                />
                                                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded border text-[10px]">
                                                    <input
                                                        type="text"
                                                        value={cakePhoto}
                                                        onChange={(e) => setCakePhoto(e.target.value)}
                                                        placeholder="Paste Image URL"
                                                        className="border px-1 py-0.5 rounded text-[10px] w-36"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                                <div className="text-gray-300 flex flex-col items-center">
                                                    <span className="text-3xl mb-1 text-gray-300">🎂</span>
                                                    <p className="text-[10px] text-gray-400">Sketch reference / Paste photo URL</p>
                                                    <input
                                                        type="text"
                                                        value={cakePhoto}
                                                        onChange={(e) => setCakePhoto(e.target.value)}
                                                        placeholder="Image URL (optional)"
                                                        className="mt-2 text-[10px] border border-gray-300 rounded px-2 py-0.5 w-44 text-center text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Stacked Cards */}
                            <div className="flex flex-col gap-3">

                                {/* Card 1: DELIVERY / PICKUP DETAILS */}
                                <div className="border-[1.5px] border-[#F2B8C4] rounded-xl overflow-hidden bg-white">
                                    <div className="bg-[#FCE2E6] text-[#7B2439] py-1 px-3 border-b border-[#F2B8C4] text-center">
                                        <h3 className="font-bold tracking-[0.15em] text-[11px] uppercase select-none">
                                            DELIVERY / PICKUP DETAILS
                                        </h3>
                                    </div>
                                    <div className="text-xs divide-y divide-[#F2B8C4]">
                                        {/* DATE */}
                                        <div className="flex items-center min-h-[26px]">
                                            <div className="w-[125px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                DATE
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : deliveryDate}
                                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* TIME */}
                                        <div className="flex items-center min-h-[26px]">
                                            <div className="w-[125px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                TIME
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : deliveryTime}
                                                    onChange={(e) => setDeliveryTime(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* ORDER TYPE */}
                                        <div className="flex items-center min-h-[26px]">
                                            <div className="w-[125px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                ORDER TYPE
                                            </div>
                                            <div className="flex-1 px-2.5 py-0.5 flex items-center gap-6">
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
                                                    <span className={`w-3.5 h-3.5 border border-gray-600 rounded-[2px] flex items-center justify-center font-bold text-[10px] ${!isBlankTemplate && orderType === 'Delivery' ? 'text-black bg-pink-100' : 'text-transparent'}`}>
                                                        {!isBlankTemplate && orderType === 'Delivery' ? '✓' : ''}
                                                    </span>
                                                    <span>Delivery</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlankTemplate && orderType === 'Delivery'}
                                                        onChange={() => setOrderType(orderType === 'Delivery' ? '' : 'Delivery')}
                                                        className="hidden"
                                                    />
                                                </label>

                                                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
                                                    <span className={`w-3.5 h-3.5 border border-gray-600 rounded-[2px] flex items-center justify-center font-bold text-[10px] ${!isBlankTemplate && orderType === 'Pickup' ? 'text-black bg-pink-100' : 'text-transparent'}`}>
                                                        {!isBlankTemplate && orderType === 'Pickup' ? '✓' : ''}
                                                    </span>
                                                    <span>Pickup</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlankTemplate && orderType === 'Pickup'}
                                                        onChange={() => setOrderType(orderType === 'Pickup' ? '' : 'Pickup')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* PICKUP LOCATION */}
                                        <div className="flex items-center min-h-[26px]">
                                            <div className="w-[125px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                PICKUP LOCATION
                                            </div>
                                            <div className="flex-1 px-2.5 py-0.5 flex items-center gap-4">
                                                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
                                                    <span className={`w-3.5 h-3.5 border border-gray-600 rounded-[2px] flex items-center justify-center font-bold text-[10px] ${!isBlankTemplate && pickupLocation === 'Al Mamzar' ? 'text-black bg-pink-100' : 'text-transparent'}`}>
                                                        {!isBlankTemplate && pickupLocation === 'Al Mamzar' ? '✓' : ''}
                                                    </span>
                                                    <span>Al Mamzar</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlankTemplate && pickupLocation === 'Al Mamzar'}
                                                        onChange={() => setPickupLocation(pickupLocation === 'Al Mamzar' ? '' : 'Al Mamzar')}
                                                        className="hidden"
                                                    />
                                                </label>

                                                <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
                                                    <span className={`w-3.5 h-3.5 border border-gray-600 rounded-[2px] flex items-center justify-center font-bold text-[10px] ${!isBlankTemplate && pickupLocation === 'Century Mall' ? 'text-black bg-pink-100' : 'text-transparent'}`}>
                                                        {!isBlankTemplate && pickupLocation === 'Century Mall' ? '✓' : ''}
                                                    </span>
                                                    <span>Century Mall</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={!isBlankTemplate && pickupLocation === 'Century Mall'}
                                                        onChange={() => setPickupLocation(pickupLocation === 'Century Mall' ? '' : 'Century Mall')}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* DELIVERY ADDRESS (3 Lines) */}
                                        <div className="flex min-h-[64px]">
                                            <div className="w-[125px] px-2.5 py-2 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase flex items-start">
                                                DELIVERY ADDRESS
                                            </div>
                                            <div className="flex-1 p-2 space-y-2">
                                                <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                                    <input
                                                        type="text"
                                                        value={addressLines[0] || ''}
                                                        onChange={(e) => {
                                                            const newLines = [...addressLines];
                                                            newLines[0] = e.target.value;
                                                            setDeliveryAddress(newLines.join('\n'));
                                                        }}
                                                        placeholder=""
                                                        className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                    />
                                                </div>
                                                <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                                    <input
                                                        type="text"
                                                        value={addressLines[1] || ''}
                                                        onChange={(e) => {
                                                            const newLines = [...addressLines];
                                                            newLines[1] = e.target.value;
                                                            setDeliveryAddress(newLines.join('\n'));
                                                        }}
                                                        placeholder=""
                                                        className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                    />
                                                </div>
                                                <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                                    <input
                                                        type="text"
                                                        value={addressLines[2] || ''}
                                                        onChange={(e) => {
                                                            const newLines = [...addressLines];
                                                            newLines[2] = e.target.value;
                                                            setDeliveryAddress(newLines.join('\n'));
                                                        }}
                                                        placeholder=""
                                                        className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2: CAKE DETAILS */}
                                <div className="border-[1.5px] border-[#F2B8C4] rounded-xl overflow-hidden bg-white">
                                    <div className="bg-[#FCE2E6] text-[#7B2439] py-1 px-3 border-b border-[#F2B8C4] text-center">
                                        <h3 className="font-bold tracking-[0.15em] text-[11px] uppercase select-none">
                                            CAKE DETAILS
                                        </h3>
                                    </div>
                                    <div className="text-xs divide-y divide-[#F2B8C4]">
                                        {/* FLAVOUR */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                FLAVOUR
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : flavour}
                                                    onChange={(e) => setFlavour(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* SIZE / WEIGHT */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                SIZE / WEIGHT
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : sizeWeight}
                                                    onChange={(e) => setSizeWeight(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* SHAPE */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                SHAPE
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : shape}
                                                    onChange={(e) => setShape(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* TIERS */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                TIERS
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : tiers}
                                                    onChange={(e) => setTiers(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* FROSTING / FILLING */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                FROSTING / FILLING
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : frostingFilling}
                                                    onChange={(e) => setFrostingFilling(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* COLOUR / THEME */}
                                        <div className="flex items-center min-h-[25px]">
                                            <div className="w-[125px] px-2.5 py-0.5 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                                COLOUR / THEME
                                            </div>
                                            <div className="flex-1 px-2 py-0.5">
                                                <input
                                                    type="text"
                                                    value={isBlankTemplate ? '' : colorTheme}
                                                    onChange={(e) => setColorTheme(e.target.value)}
                                                    placeholder=""
                                                    className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 4. Bottom Box: CUSTOMISATION DETAILS */}
                        <div className="border-[1.5px] border-[#F2B8C4] rounded-xl overflow-hidden bg-white">
                            <div className="bg-[#FCE2E6] text-[#7B2439] py-1 px-3 border-b border-[#F2B8C4] text-center">
                                <h3 className="font-bold tracking-[0.15em] text-[11px] uppercase select-none">
                                    CUSTOMISATION DETAILS
                                </h3>
                            </div>
                            <div className="text-xs divide-y divide-[#F2B8C4]">
                                {/* MESSAGE ON CAKE */}
                                <div className="flex items-center min-h-[26px]">
                                    <div className="w-[180px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                        MESSAGE ON CAKE
                                    </div>
                                    <div className="flex-1 px-2 py-0.5">
                                        <input
                                            type="text"
                                            value={isBlankTemplate ? '' : messageOnCake}
                                            onChange={(e) => setMessageOnCake(e.target.value)}
                                            placeholder=""
                                            className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* MESSAGE ON BOARD */}
                                <div className="flex items-center min-h-[26px]">
                                    <div className="w-[180px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                        MESSAGE ON BOARD
                                    </div>
                                    <div className="flex-1 px-2 py-0.5">
                                        <input
                                            type="text"
                                            value={isBlankTemplate ? '' : messageOnBoard}
                                            onChange={(e) => setMessageOnBoard(e.target.value)}
                                            placeholder=""
                                            className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* NAME / AGE / NUMBER */}
                                <div className="flex items-center min-h-[26px]">
                                    <div className="w-[180px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                        NAME / AGE / NUMBER
                                    </div>
                                    <div className="flex-1 px-2 py-0.5">
                                        <input
                                            type="text"
                                            value={isBlankTemplate ? '' : nameAgeNumber}
                                            onChange={(e) => setNameAgeNumber(e.target.value)}
                                            placeholder=""
                                            className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* ADDITIONAL DECORATIONS */}
                                <div className="flex items-center min-h-[26px]">
                                    <div className="w-[180px] px-2.5 py-1 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase">
                                        ADDITIONAL DECORATIONS
                                    </div>
                                    <div className="flex-1 px-2 py-0.5">
                                        <input
                                            type="text"
                                            value={isBlankTemplate ? '' : additionalDecorations}
                                            onChange={(e) => setAdditionalDecorations(e.target.value)}
                                            placeholder=""
                                            className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                        />
                                    </div>
                                </div>

                                {/* SPECIAL INSTRUCTIONS (3 Lines) */}
                                <div className="flex min-h-[64px]">
                                    <div className="w-[180px] px-2.5 py-2 font-bold text-gray-800 tracking-wider text-[10px] border-r border-[#F2B8C4] uppercase flex items-start">
                                        SPECIAL INSTRUCTIONS
                                    </div>
                                    <div className="flex-1 p-2 space-y-2">
                                        <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                            <input
                                                type="text"
                                                value={instructionsLines[0] || ''}
                                                onChange={(e) => {
                                                    const newLines = [...instructionsLines];
                                                    newLines[0] = e.target.value;
                                                    setSpecialInstructions(newLines.join('\n'));
                                                }}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                        <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                            <input
                                                type="text"
                                                value={instructionsLines[1] || ''}
                                                onChange={(e) => {
                                                    const newLines = [...instructionsLines];
                                                    newLines[1] = e.target.value;
                                                    setSpecialInstructions(newLines.join('\n'));
                                                }}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                        <div className="border-b border-[#E8A5B2] min-h-[14px]">
                                            <input
                                                type="text"
                                                value={instructionsLines[2] || ''}
                                                onChange={(e) => {
                                                    const newLines = [...instructionsLines];
                                                    newLines[2] = e.target.value;
                                                    setSpecialInstructions(newLines.join('\n'));
                                                }}
                                                placeholder=""
                                                className="w-full bg-transparent text-xs text-gray-800 outline-none font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
