import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

const MapComponent = ({ cities }) => {
  const [destination, setDestination] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [productName, setProductName] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [costDetails, setCostDetails] = useState({
    distance: { label: "المسافة الإجمالية", value: "0.00", unit: "كم" },
    pricePerKm: { label: "سعر الكيلومتر", value: "0.00", unit: "درهم" },
    deliveryCost: { label: "تكلفة التوصيل الأساسية", value: "0.00", unit: "درهم" },
    additionalDeliveryCosts: {
      label: "تكاليف توصيل إضافية",
      value: "0.00",
      details: {
        unloadingCost: { label: "التوصيل مع التنزيل (10% من إجمالي التكاليف)", value: "0.00", unit: "درهم" },
        unloadingNextDayCost: { label: "تكلفة التفريغ يوم آخر (20%)", value: "0.00", unit: "درهم" },
      }
    },
    operationalCosts: {
      label: "تكاليف تشغيلية",
      value: "0.00",
      details: {
        violationsCost: { label: "تكاليف المخالفات", value: "0.00", unit: "درهم" },
        highwayCost: { label: "تكاليف طريق السيار", value: "0.00", unit: "درهم" },
      }
    },
    fixedCosts: {
      label: "التكاليف الثابتة",
      value: "0.00",
      details: {
        truckMaintenance: { label: "صيانة الشاحنة", value: "0.00", unit: "درهم" },
        specialTax6Months: { label: "الضريبة الخاصة (6 أشهر)", value: "0.00", unit: "درهم" },
        technicalInspection: { label: "الفحص التقني", value: "0.00", unit: "درهم" },
        insurance: { label: "التأمين", value: "0.00", unit: "درهم" },
      }
    },
    driverCosts: {
      label: "تكاليف السائق",
      value: "0.00",
      details: {
        monthlyDriverSalary: { label: "أجر السائق الشهري", value: "0.00", unit: "درهم" },
        driverDailyWage: { label: "أجر السائق اليومي", value: "0.00", unit: "درهم" },
      }
    },
    netProfit: { label: "الربح الصافي", value: "0.00", unit: "درهم" },
  });
  const [displayedTotalCost, setDisplayedTotalCost] = useState(0);
  const [showCostDetailsModal, setShowCostDetailsModal] = useState(false);
  const [showSummaryPrintModal, setShowSummaryPrintModal] = useState(false);

  const [requiresUnloading, setRequiresUnloading] = useState(false);
  const [unloadingNextDay, setUnloadingNextDay] = useState(false);
  const [isUnloadingNextDayDisabled, setIsUnloadingNextDayDisabled] = useState(false);

  const [monthlyDriverSalary, setMonthlyDriverSalary] = useState('5000');
  const [pricePerKm, setPricePerKm] = useState('3.2');
  const [discountPercentage, setDiscountPercentage] = useState('0');

  const [savedConsultations, setSavedConsultations] = useState([]);

  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleProductNameChange = (e) => {
    const input = e.target.value;
    setProductName(input);
    if (input.length > 0 && Array.isArray(products)) {
      setFilteredProducts(products.filter(product =>
        product && product.name && product.name.toLowerCase().includes(input.toLowerCase())
      ));
      setShowProductSuggestions(true);
    } else {
      setFilteredProducts([]);
      setShowProductSuggestions(false);
    }
  };

  const handleProductSelect = (product) => {
    if (product && product.name) {
      setProductName(product.name);
      setShowProductSuggestions(false);
    }
  };

  const handleDestinationInputChange = (e) => {
    const input = e.target.value;
    setDestination(input);
    if (input.length > 0 && Array.isArray(cities)) {
      setFilteredDestinations(cities.filter(city =>
        city && city.name && city.name.toLowerCase().includes(input.toLowerCase())
      ));
      setShowDestinationSuggestions(true);
    } else {
      setFilteredDestinations([]);
      setShowDestinationSuggestions(false);
    }
  };

  const handleDestinationSelect = (city) => {
    if (city && city.name) {
      setDestination(city.name);
      setShowDestinationSuggestions(false);
    }
  };

  const calculateCost = () => {
    const originCity = cities.find(city => city.name === "JET MODULAIRE");
    const destinationCity = cities.find(city => city.name === destination);

    let distance = 0;
    if (originCity && destinationCity) {
      distance = Math.abs(destinationCity.distance - originCity.distance) * 2;
    } else {
      console.warn("Origin or Destination city not found. Using distance 0.");
    }

    // منطق تفعيل/تعطيل التفريغ في يوم آخر بناءً على المسافة
    if (distance > 500) {
      setUnloadingNextDay(true); // تفعيل تلقائي
      setIsUnloadingNextDayDisabled(true); // تعطيل الخانة
    } else {
      setIsUnloadingNextDayDisabled(false); // تمكين الخانة
      // لا نغير قيمة unloadingNextDay هنا للسماح للمستخدم بالتحكم بها يدوياً عندما تكون المسافة <= 500
    }

    const parsedPricePerKm = parseFloat(pricePerKm) || 3.2;
    let deliveryCost = distance * parsedPricePerKm;
    
    // تطبيق التكاليف بناءً على المسافة
    let violationsCost = distance < 200 ? 350 : 500;
    let highwayCost = distance < 200 ? 200 : 400;
    
    let parsedNetProfit = 0; // Initialize parsedNetProfit

    // تعيين الربح الصافي الأساسي بناءً على المسافة
    if (distance < 250) {
      parsedNetProfit = 700; // 700 AED if distance < 250km
    } else {
      parsedNetProfit = 1000; // 1000 AED if distance >= 250km
    }

    // إضافة زيادة الربح الصافي بناءً على التوصيل مع التنزيل والمسافة
    if (requiresUnloading) {
      if (distance < 200) {
        parsedNetProfit += 300; // +300 AED to Net Profit if distance < 200km
      } else if (distance >= 200 && distance < 500) {
        parsedNetProfit += 500; // +500 AED to Net Profit if distance between 200km and 500km
      } else if (distance >= 500) {
        parsedNetProfit += 1000; // +1000 AED to Net Profit if distance > 500km
      }
    }

    // إضافة زيادة الربح الصافي بناءً على التفريغ في يوم آخر والمسافة
    if (unloadingNextDay) {
      if (distance < 200) {
        parsedNetProfit += 300; // +300 AED to Net Profit if distance < 200km
      } else if (distance >= 200 && distance < 500) {
        parsedNetProfit += 600; // +600 AED to Net Profit if distance between 200km and 500km
      } else if (distance >= 500 && distance < 1000) {
        parsedNetProfit += 800; // +800 AED to Net Profit if distance between 500km and 1000km
      } else if (distance >= 1000) {
        parsedNetProfit += 1000; // +1000 AED to Net Profit if distance > 1000km
      }
    }

    let truckMaintenance = 200;
    let specialTax6Months = 100;
    let technicalInspection = 50;
    let insurance = 50;

    // ----- New Unloading Cost Calculation (Fixed Amount) -----
    let calculatedUnloadingCost = 0;
    if (requiresUnloading) {
      calculatedUnloadingCost = 300; // Fixed amount of 300 AED
    }
    // --------------------------------------------------------

    // حساب التكلفة الأساسية قبل التنزيل والتفريغ
    let baseCost = deliveryCost + violationsCost + highwayCost + parsedNetProfit + 
                  truckMaintenance + specialTax6Months + technicalInspection + insurance;
    
    const parsedMonthlyDriverSalary = parseFloat(monthlyDriverSalary) || 0;
    let driverDailyWage = (parsedMonthlyDriverSalary / 26);

    if (distance > 250) {
      driverDailyWage *= 2;
    }
    baseCost += driverDailyWage;

    const parsedDiscountPercentage = parseFloat(discountPercentage) || 0;
    const discountAmount = (baseCost * parsedDiscountPercentage) / 100; // Discount applied to baseCost
    let costAfterBaseAndDiscount = baseCost - discountAmount;

    // ----- New Unloading Next Day Cost Calculation (Fixed Amount) -----
    let unloadingNextDayCost = 0;
    if (unloadingNextDay) {
      unloadingNextDayCost = 300; // Fixed amount of 300 AED
    }
    // --------------------------------------------------------

    // Calculate final cost
    let finalCost = costAfterBaseAndDiscount + calculatedUnloadingCost + unloadingNextDayCost;

    // Calculate cost details for display
    const costDetails = {
      distance: { label: "المسافة الإجمالية", value: distance.toFixed(2), unit: "كم" },
      pricePerKm: { label: "سعر الكيلومتر", value: parsedPricePerKm.toFixed(2), unit: "درهم" },
      deliveryCost: { label: "تكلفة التوصيل الأساسية", value: deliveryCost.toFixed(2), unit: "درهم" },
      operationalCosts: {
        label: "تكاليف تشغيلية",
        value: (violationsCost + highwayCost).toFixed(2), unit: "درهم",
        details: {
          violationsCost: { label: "تكاليف المخالفات", value: violationsCost.toFixed(2), unit: "درهم" },
          highwayCost: { label: "تكاليف طريق السيار", value: highwayCost.toFixed(2), unit: "درهم" }
        }
      },
      driverCosts: {
        label: "تكاليف السائق",
        value: driverDailyWage.toFixed(2), unit: "درهم",
        details: {
          monthlyDriverSalary: { label: "أجر السائق الشهري", value: parsedMonthlyDriverSalary.toFixed(2), unit: "درهم" },
          driverDailyWage: { label: "أجر السائق اليومي", value: driverDailyWage.toFixed(2), unit: "درهم" }
        }
      },
      fixedCosts: {
        label: "التكاليف الثابتة",
        value: (truckMaintenance + specialTax6Months + technicalInspection + insurance).toFixed(2), unit: "درهم",
        details: {
          truckMaintenance: { label: "صيانة الشاحنة", value: truckMaintenance.toFixed(2), unit: "درهم" },
          specialTax6Months: { label: "الضريبة الخاصة 6 أشهر", value: specialTax6Months.toFixed(2), unit: "درهم" },
          technicalInspection: { label: "الفحص التقني", value: technicalInspection.toFixed(2), unit: "درهم" },
          insurance: { label: "التأمين", value: insurance.toFixed(2), unit: "درهم" }
        }
      },
      netProfit: { label: "صافي الربح", value: parsedNetProfit.toFixed(2), unit: "درهم" },
      additionalDeliveryCosts: {
        label: "تكاليف إضافية",
        value: (calculatedUnloadingCost + unloadingNextDayCost).toFixed(2), unit: "درهم",
        details: {
          unloadingCost: { label: "التوصيل مع التنزيل (300 درهم ثابت)", value: calculatedUnloadingCost.toFixed(2), unit: "درهم" },
          unloadingNextDayCost: { label: "التفريغ في يوم آخر (300 درهم ثابت)", value: unloadingNextDayCost.toFixed(2), unit: "درهم" }
        }
      },
      finalCost: {
        label: "التكلفة النهائية",
        value: finalCost.toFixed(2), unit: "درهم"
      },
      discount: {
        label: "الخصم",
        value: discountAmount.toFixed(2), unit: "درهم",
        details: {
          percentage: { label: "نسبة الخصم", value: `${parsedDiscountPercentage}`, unit: "%" }
        }
      }
    };

    // Add product name to costDetails if it's not empty
    if (productName) {
      costDetails.productName = { label: "المنتج", value: productName };
    }

    setTotalCost(finalCost);
    setDisplayedTotalCost(finalCost);
    setCostDetails(costDetails);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowCostDetailsModal(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">تفاصيل التكلفة</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>المسافة الإجمالية:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.distance.value} ${costDetails.distance.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>سعر الكيلومتر:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.pricePerKm.value} ${costDetails.pricePerKm.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>تكلفة التوصيل الأساسية:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.deliveryCost.value} ${costDetails.deliveryCost.unit}</td>
          </tr>
          ${costDetails.additionalDeliveryCosts.details.unloadingCost.value !== "0.00" ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>${costDetails.additionalDeliveryCosts.details.unloadingCost.label}:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.additionalDeliveryCosts.details.unloadingCost.value} ${costDetails.additionalDeliveryCosts.details.unloadingCost.unit}</td>
          </tr>` : ''}
          ${costDetails.additionalDeliveryCosts.details.unloadingNextDayCost.value !== "0.00" ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>${costDetails.additionalDeliveryCosts.details.unloadingNextDayCost.label}:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.additionalDeliveryCosts.details.unloadingNextDayCost.value} ${costDetails.additionalDeliveryCosts.details.unloadingNextDayCost.unit}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>تكاليف المخالفات:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.operationalCosts.details.violationsCost.value} ${costDetails.operationalCosts.details.violationsCost.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>تكاليف طريق السيار:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.operationalCosts.details.highwayCost.value} ${costDetails.operationalCosts.details.highwayCost.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>صيانة الشاحنة:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.fixedCosts.details.truckMaintenance.value} ${costDetails.fixedCosts.details.truckMaintenance.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>الضريبة الخاصة (6 أشهر):</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.fixedCosts.details.specialTax6Months.value} ${costDetails.fixedCosts.details.specialTax6Months.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>الفحص التقني:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.fixedCosts.details.technicalInspection.value} ${costDetails.fixedCosts.details.technicalInspection.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>التأمين:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.fixedCosts.details.insurance.value} ${costDetails.fixedCosts.details.insurance.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>أجر السائق اليومي:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.driverCosts.details.driverDailyWage.value} ${costDetails.driverCosts.details.driverDailyWage.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>الربح الصافي:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${costDetails.netProfit.value} ${costDetails.netProfit.unit}</td>
          </tr>
          <tr style="background-color: #e0e0e0;">
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>إجمالي التكلفة النهائية:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>${displayedTotalCost.toFixed(2)} درهم</strong></td>
          </tr>
        </table>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintSummary = () => {
    const summaryPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">ملخص التكلفة</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>إجمالي التكلفة:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${displayedTotalCost.toFixed(2)} درهم</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>نقطة الانطلاق:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">JET MODULAIRE</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>نقطة الوصول:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${destination}</td>
          </tr>
          ${productName ? `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; background-color: #f2f2f2;"><strong>المنتج المراد شحنه:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${productName}</td>
          </tr>` : ''}
        </table>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(summaryPrintContent);
    printWindow.document.close();
    printWindow.print();
  };

  const calculateBaseCost = () => {
    // This function is no longer used in the main calculation flow
    // but kept for potential future reference or other print layouts if needed.
    const originCity = cities.find(city => city.name === "JET MODULAIRE");
    const destinationCity = cities.find(city => city.name === destination);

    let distance = 0;
    if (originCity && destinationCity) {
      distance = Math.abs(destinationCity.distance - originCity.distance) * 2;
    }

    const parsedPricePerKm = parseFloat(pricePerKm) || 3.2;
    let deliveryCost = distance * parsedPricePerKm;
    
    let violationsCost = distance < 200 ? 350 : 500;
    let highwayCost = distance < 200 ? 200 : 400;
    
    let parsedNetProfit = 0; // Initialize parsedNetProfit

    // تعيين الربح الصافي الأساسي بناءً على المسافة
    if (distance < 250) {
      parsedNetProfit = 700; // 700 AED if distance < 250km
    } else {
      parsedNetProfit = 1000; // 1000 AED if distance >= 250km
    }

    // إضافة زيادة الربح الصافي بناءً على التوصيل مع التنزيل والمسافة
    if (requiresUnloading) {
      if (distance < 200) {
        parsedNetProfit += 300; // +300 AED to Net Profit if distance < 200km
      } else if (distance >= 200 && distance < 500) {
        parsedNetProfit += 500; // +500 AED to Net Profit if distance between 200km and 500km
      } else if (distance >= 500) {
        parsedNetProfit += 1000; // +1000 AED to Net Profit if distance > 500km
      }
    }

    // إضافة زيادة الربح الصافي بناءً على التفريغ في يوم آخر والمسافة
    if (unloadingNextDay) {
      if (distance < 200) {
        parsedNetProfit += 300; // +300 AED to Net Profit if distance < 200km
      } else if (distance >= 200 && distance < 500) {
        parsedNetProfit += 600; // +600 AED to Net Profit if distance between 200km and 500km
      } else if (distance >= 500 && distance < 1000) {
        parsedNetProfit += 800; // +800 AED to Net Profit if distance between 500km and 1000km
      } else if (distance >= 1000) {
        parsedNetProfit += 1000; // +1000 AED to Net Profit if distance > 1000km
      }
    }

    let truckMaintenance = 200;
    let specialTax6Months = 100;
    let technicalInspection = 50;
    let insurance = 50;
    
    const parsedMonthlyDriverSalary = parseFloat(monthlyDriverSalary) || 0;
    let driverDailyWage = (parsedMonthlyDriverSalary / 26);

    if (distance > 250) {
      driverDailyWage *= 2;
    }

    return deliveryCost + violationsCost + highwayCost + parsedNetProfit + 
           truckMaintenance + specialTax6Months + technicalInspection + 
           insurance + driverDailyWage;
  };

  useEffect(() => {
    if (destination) {
      calculateCost();
    }
  }, [cities, destination, monthlyDriverSalary, requiresUnloading, unloadingNextDay, pricePerKm, discountPercentage]);

  useEffect(() => {
    const storedConsultations = localStorage.getItem('consultations');
    if (storedConsultations) {
      setSavedConsultations(JSON.parse(storedConsultations));
    }
  }, []);

  const handleSaveConsultation = () => {
    const newConsultation = {
      id: Date.now(),
      origin: "JET MODULAIRE",
      destination: destination,
      distance: costDetails.distance.value,
      totalCost: displayedTotalCost.toFixed(2),
      productName: productName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setSavedConsultations([...savedConsultations, newConsultation]);
    localStorage.setItem('consultations', JSON.stringify([...savedConsultations, newConsultation]));
    showNotification('Consultation enregistrée avec succès !', 'success');
  };

  const handleDownloadSummaryImage = () => {
    const summaryElement = document.querySelector('.summary-details');
    if (summaryElement) {
      html2canvas(summaryElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 'consultation-summary.png';
        link.href = canvas.toDataURL();
        link.click();
        showNotification('ملخص التكلفة تم تنزيله بنجاح كصورة!', 'success');
      }).catch(error => {
        console.error('Error capturing summary for download:', error);
        showNotification('حدث خطأ أثناء تنزيل الملخص.', 'error');
      });
    } else {
      showNotification('تعذر العثور على ملخص التكلفة لتنزيله.', 'error');
    }
  };

  return (
    <div className="map-container">
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out',
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: notification.type === 'success' ? '#28a745' : '#dc3545',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {notification.type === 'success' ? '✓' : '!'}
          </div>
          <span style={{ fontWeight: '500' }}>{notification.message}</span>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div className="total-cost-display">
        <h2>إجمالي التكلفة: {displayedTotalCost.toFixed(2)} درهم</h2>
        <div className="button-group">
          <button className="show-details-button" onClick={() => setShowCostDetailsModal(true)}>
            عرض التفاصيل
          </button>
          <button className="print-button" onClick={handlePrint}>
            <i className="fas fa-print"></i> طباعة التكاليف
          </button>
          <button className="print-summary-button" onClick={() => setShowSummaryPrintModal(true)}>
            <i className="fas fa-print"></i> طباعة الملخص
          </button>
          <button className="save-consultation-button" onClick={handleSaveConsultation}>
            حفظ الاستشارة
          </button>
        </div>
      </div>
      <div className="input-section">
        <div className="location-inputs">
          <div className="input-group">
            <label>نقطة الانطلاق</label>
            <input
              type="text"
              className="app-input"
              value="JET MODULAIRE"
              readOnly
            />
          </div>
          <div className="input-group">
            <label>نقطة الوصول</label>
            <input
              type="text"
              className="app-input"
              value={destination}
              onChange={handleDestinationInputChange}
              onFocus={() => setShowDestinationSuggestions(true)}
              onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 100)}
              placeholder="أدخل مدينة الوصول"
            />
            {showDestinationSuggestions && filteredDestinations.length > 0 && (
              <ul className="suggestions-list">
                {filteredDestinations.map((city) => (
                  <li key={city.name} onMouseDown={() => handleDestinationSelect(city)}>
                    {city.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="input-group">
          <label>أجر السائق الشهري</label>
          <input
            type="number"
            id="monthlyDriverSalary"
            value={monthlyDriverSalary}
            onChange={(e) => setMonthlyDriverSalary(e.target.value)}
            placeholder="أدخل الراتب الشهري للسائق"
            className="app-input"
          />
        </div>

        <div className="input-group">
          <label>سعر الكيلومتر (درهم)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="app-input"
            value={pricePerKm}
            onChange={(e) => setPricePerKm(e.target.value)}
            placeholder="أدخل سعر الكيلومتر"
          />
        </div>

        <div className="input-group">
          <label>نسبة الخصم (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="app-input"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
            placeholder="أدخل نسبة الخصم"
          />
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="requiresUnloading"
            checked={requiresUnloading}
            onChange={(e) => setRequiresUnloading(e.target.checked)}
          />
          <label htmlFor="requiresUnloading">التوصيل مع التنزيل (300 درهم ثابت)</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="unloadingNextDay"
            checked={unloadingNextDay}
            onChange={(e) => setUnloadingNextDay(e.target.checked)}
            disabled={isUnloadingNextDayDisabled}
          />
          <label htmlFor="unloadingNextDay">التفريغ في يوم آخر (300 درهم ثابت)</label>
        </div>

        <div className="input-group">
          <label>المنتج المراد شحنه</label>
          <input
            type="text"
            className="app-input"
            value={productName}
            onChange={handleProductNameChange}
            placeholder="ابحث عن منتج أو اكتبه"
          />
          {showProductSuggestions && filteredProducts.length > 0 && (
            <ul className="suggestions-list">
              {filteredProducts.map(product => (
                <li key={product.id} onClick={() => handleProductSelect(product)}>
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={calculateCost} className="calculate-button">
          حساب التكلفة
        </button>
      </div>

      {showCostDetailsModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <h2>تفاصيل التكلفة</h2>
            <div className="cost-details-grid">
              {Object.entries(costDetails).map(([key, item]) => (
                <div key={key} className="detail-group">
                  <h3>{item.label}: {item.value} {item.unit ? item.unit : ""}</h3>
                  {item.details && (
                    <div className="sub-details">
                      {Object.entries(item.details).map(([subKey, subItem]) => (
                        <p key={subKey}>{subItem.label}: <span>{subItem.value} {subItem.unit ? subItem.unit : ""}</span></p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {productName && (
                <div className="detail-group">
                  <h3>المنتج: {productName}</h3>
                </div>
              )}
            </div>
            <button onClick={() => setShowCostDetailsModal(false)} className="app-button">إغلاق</button>
            <button onClick={handlePrint} className="app-button print-button">طباعة</button>
          </div>
        </div>
      )}

      {showSummaryPrintModal && (
        <div className="modal-overlay" onClick={() => setShowSummaryPrintModal(false)}>
          <div className="modal-content">
            <h2>ملخص التكلفة</h2>
            <div className="summary-details">
              <p><strong>إجمالي التكلفة:</strong> {displayedTotalCost.toFixed(2)} درهم</p>
              <p><strong>نقطة الانطلاق:</strong> JET MODULAIRE</p>
              <p><strong>نقطة الوصول:</strong> {destination}</p>
              {productName && <p><strong>المنتج المراد شحنه:</strong> {productName}</p>}
              <p><strong>المسافة:</strong> {costDetails.distance.value} كم</p>
              <p><strong>تاريخ الاستشارة:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <button onClick={handlePrintSummary} className="app-button print-summary-button">طباعة الملخص</button>
            <button onClick={handleDownloadSummaryImage} className="app-button download-image-button">تنزيل كصورة</button>
            <button onClick={() => setShowSummaryPrintModal(false)} className="app-button">إغلاق</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent; 