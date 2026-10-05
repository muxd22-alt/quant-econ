const formatter = new Intl.NumberFormat('ar-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
});

function fmt(n) { return formatter.format(Math.round(n)) + ' ريال'; }

function calculatePV(rate, nper, pmt) {
    if (rate === 0) return pmt * nper;
    return pmt * (1 - Math.pow(1 + rate, -nper)) / rate;
}

function calculatePMT(rate, nper, pv) {
    if (rate === 0) return pv / nper;
    return pv * rate / (1 - Math.pow(1 + rate, -nper));
}

// ───── Crypto Toggle Visual ─────
document.getElementById('crypto-toggle').addEventListener('change', function(e) {
    document.getElementById('cycle-start-group').style.display = e.target.checked ? 'flex' : 'none';
    if (e.target.checked) {
        document.documentElement.style.setProperty('--primary', '#f59e0b');
        document.documentElement.style.setProperty('--primary-glow', 'rgba(245, 158, 11, 0.5)');
    } else {
        document.documentElement.style.setProperty('--primary', '#3b82f6');
        document.documentElement.style.setProperty('--primary-glow', 'rgba(59, 130, 246, 0.5)');
    }
});

// ───── Phase Names & Descriptions ─────
const phaseNames = {
    1: { name: 'مرحلة التأسيس', icon: '🏗️' },
    2: { name: 'مرحلة النضج', icon: '📈' },
    3: { name: 'مرحلة التسارع', icon: '🚀' },
    4: { name: 'مرحلة الحصاد', icon: '🌾' },
    5: { name: 'مرحلة الحرية', icon: '🏆' }
};

function getPhaseDescription(phaseIndex, useCrypto, salary, mortBal, stockVal, plInst, mortInst, totalMortPrincipal) {
    let mortPercent = totalMortPrincipal > 0 ? Math.round((mortBal / totalMortPrincipal) * 100) : 0;
    let info = phaseNames[phaseIndex] || { name: `مرحلة ${phaseIndex}`, icon: '📊' };
    
    if (phaseIndex === 1) {
        return `<strong>${info.icon} ${info.name} (السنوات 1-5):</strong><br>
        هنا نبدأ رحلتنا. نأخذ <strong>أعلى قرض شخصي ممكن</strong> (33.33% من الراتب) للزواج والتأثيث، بينما يبقى قسط العقار المرن <strong>بالحد الأدنى</strong> (21.67%). 
        في نفس الوقت نبدأ ببناء <strong>محفظة أسهم</strong> من الاستقطاع الشهري — هذه المحفظة هي سلاحنا المستقبلي لـ"جلد العقار".
        <br><em style="color:var(--text-muted);">الهدف: البقاء على قيد الحياة المالية مع بناء الأساس.</em>`;
    }
    
    if (mortBal <= 0) {
        return `<strong>${info.icon} ${info.name}:</strong><br>
        🎉 <strong style="color:var(--secondary);">تهانينا! العقار مسدد بالكامل!</strong> لم يعد هناك قسط عقاري. 
        كل الدخل الآن يتوجه للمعيشة وتنمية المحفظة الاستثمارية. التوزيعات الشهرية تزيد راتبك الفعلي بشكل ملحوظ.
        <br><em style="color:var(--text-muted);">الهدف: تراكم الثروة بأقصى سرعة قبل التقاعد.</em>`;
    }
    
    if (mortPercent > 70) {
        return `<strong>${info.icon} ${info.name}:</strong><br>
        ما زال أمامنا <strong>${mortPercent}%</strong> من أصل العقار. ${useCrypto ? 'نواصل التجميع المكثف في المحفظة استعداداً لقمة الدورة القادمة.' : 'المحفظة تنمو تدريجياً. عند انتهاء القرض الشخصي، سنحاول إعادة الهيكلة لخفض القسط العقاري.<br>إذا لم تكفِ السيولة، سيرتفع قسط العقار المرن — وهذا أمر طبيعي ومؤقت.'}
        <br><em style="color:var(--text-muted);">الهدف: بناء سيولة كافية للضربة القادمة.</em>`;
    }
    
    if (mortPercent > 30) {
        return `<strong>${info.icon} ${info.name}:</strong><br>
        ممتاز! العقار تقلص إلى <strong>${mortPercent}%</strong> فقط من الأصل. ${useCrypto ? 'الدورة القادمة ستكون الضربة القاضية!' : 'المحفظة أصبحت قوية بما يكفي لإجراء إعادة هيكلة ناجحة. القرض الشخصي سيتحول لـ"وقود استثماري".'}
        <br><em style="color:var(--text-muted);">الهدف: الضغط على العقار وتوسيع المحفظة.</em>`;
    }
    
    return `<strong>${info.icon} ${info.name}:</strong><br>
    تبقى <strong>${mortPercent}%</strong> فقط من العقار! أنت على بُعد خطوات من الحرية المالية. 
    التوزيعات الشهرية ترفع مستوى معيشتك والمحفظة تنمو بشكل تصاعدي.
    <br><em style="color:var(--text-muted);">الهدف: الوصول للحرية المالية.</em>`;
}

// ───── UI Sliders Real-time Updates ─────
const sliders = ['salary-bump-5', 'salary-bump-10', 'mortgage-apr', 'sakani-support', 'years', 'monthly-investment', 'target-payoff'];
sliders.forEach(id => {
    const el = document.getElementById(id);
    const span = document.getElementById(`val-${id}`);
    if(el && span) {
        el.addEventListener('input', () => {
            span.innerText = el.value;
        });
        el.addEventListener('change', runSimulation);
    }
});

document.getElementById('initial-salary').addEventListener('input', runSimulation);
document.getElementById('crypto-toggle').addEventListener('change', runSimulation);
document.getElementById('cycle-start').addEventListener('change', runSimulation);

function runSimulation(e) {
    if (e && e.preventDefault) e.preventDefault();
    
    const useCrypto = document.getElementById('crypto-toggle').checked;
    const cycleStart = parseInt(document.getElementById('cycle-start').value, 10);
    
    const initialSalary = parseFloat(document.getElementById('initial-salary').value);
    const bump5 = parseFloat(document.getElementById('salary-bump-5').value);
    const bump10 = parseFloat(document.getElementById('salary-bump-10').value);
    const mortApr = parseFloat(document.getElementById('mortgage-apr').value) / 100;
    const plApr = 2.5 / 100;
    const stockGrowth = 7.0 / 100;
    
    // Sliders support parsing
    const monthlyInvestment = parseFloat(document.getElementById('monthly-investment').value) || 0;
    const sakaniSupport = parseFloat(document.getElementById('sakani-support').value) * 1000 || 0; // User said 100 for 100,000
    const totalYears = parseInt(document.getElementById('years').value, 10);
    const targetPayoffPerc = parseFloat(document.getElementById('target-payoff').value) / 100;
    const stockDiv = 2.0 / 100; // YoC base
    
    const mortRateM = mortApr / 12;
    const plRateM = plApr / 12;
    const stockRateM = stockGrowth / 12;
    
    const dbrLimit = 0.55;
    const plLimit = 0.3333;
    const mortLimitInit = dbrLimit - plLimit;
    
    let currentSalary = initialSalary;
    let mortTermMonths = totalYears * 12;
    
    let pl1Installment = currentSalary * plLimit;
    let mortInstallment = currentSalary * mortLimitInit;
    let pl1Principal = calculatePV(plRateM, 60, pl1Installment);
    
    // Flexible mortgage: low first 5 years, then jumps to full DBR
    let mortJumpInstallment = currentSalary * dbrLimit;
    let mortPrincipalPart1 = calculatePV(mortRateM, 60, mortInstallment);
    let mortPrincipalPart2 = calculatePV(mortRateM, mortTermMonths - 60, mortJumpInstallment) / Math.pow(1 + mortRateM, 60);
    let totalMortPrincipal = mortPrincipalPart1 + mortPrincipalPart2;
    
    // Summary
    document.getElementById('summary-house-value').innerText = fmt(totalMortPrincipal + sakaniSupport);
    document.getElementById('summary-pl-value').innerText = fmt(pl1Principal);
    
    // ───── Build Tabs ─────
    let tabsContainer = document.getElementById('tabs-container');
    tabsContainer.innerHTML = '';
    let tabsHeader = document.createElement('div');
    tabsHeader.className = 'tabs-header';
    let tabsContentContainer = document.createElement('div');
    
    let totalPhases = Math.ceil(totalYears / 5);
    for (let phase = 1; phase <= totalPhases; phase++) {
        let info = phaseNames[phase] || { name: `مرحلة ${phase}`, icon: '📊' };
        let tabBtn = document.createElement('button');
        tabBtn.type = 'button';
        tabBtn.className = 'tab-btn' + (phase === 1 ? ' active' : '');
        tabBtn.innerHTML = `${info.icon} ${info.name}`;
        tabsHeader.appendChild(tabBtn);
        
        let tabContent = document.createElement('div');
        tabContent.className = 'tab-content' + (phase === 1 ? ' active' : '');
        
        let alertDiv = document.createElement('div');
        alertDiv.className = useCrypto ? 'phase-alert crypto-alert' : 'phase-alert';
        alertDiv.id = `alert-phase-${phase}`;
        tabContent.appendChild(alertDiv);
        
        let tableResp = document.createElement('div');
        tableResp.className = 'table-responsive';
        tableResp.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>السنة</th>
                        ${useCrypto ? '<th>حالة الدورة</th>' : ''}
                        <th>الراتب</th>
                        <th>دخل التوزيعات</th>
                        <th>قسط شخصي</th>
                        <th>قسط عقاري</th>
                        <th>المتبقي للمعيشة</th>
                        <th>رصيد العقار</th>
                        <th>محفظة الأصول</th>
                        <th>ملاحظات</th>
                    </tr>
                </thead>
                <tbody id="tbody-phase-${phase}"></tbody>
            </table>
        `;
        tabContent.appendChild(tableResp);
        tabsContentContainer.appendChild(tabContent);
    }
    
    tabsContainer.appendChild(tabsHeader);
    tabsContainer.appendChild(tabsContentContainer);
    
    // Tab switching
    let tabButtons = tabsHeader.querySelectorAll('.tab-btn');
    let tabContents = tabsContentContainer.querySelectorAll('.tab-content');
    tabButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            tabContents[idx].classList.add('active');
        });
    });
    
    // ───── Simulate Year by Year ─────
    let mortBalance = totalMortPrincipal;
    let stockPortfolio = 0; // Market Value
    let portfolioCostBasis = 0; // Cost Basis (YoC)
    let currentPLInstallment = pl1Installment;
    let currentMortInstallment = mortInstallment;
    let lastDividendMonthly = 0;
    
    for (let year = 1; year <= totalYears; year++) {
        let notes = [];
        let isMilestoneYear = (year - 1) % 5 === 0 && year > 1;
        
        // Salary bumps
        if (year === 6) { currentSalary += bump5; notes.push('📊 زيادة الراتب الأولى'); }
        else if (year === 11) { currentSalary += bump10; notes.push('📊 زيادة الراتب الثانية'); }
        
        if (isMilestoneYear && mortBalance > 0) {
            let remainingMortMonths = (totalYears - year + 1) * 12;
            let targetThreshold = totalMortPrincipal * targetPayoffPerc;
            
            let maxPlInstallment = currentSalary * plLimit; 
            let DBR = currentSalary * dbrLimit;
            
            if (mortBalance <= targetThreshold) {
                // Focus on portfolio: Mortgage is small enough
                let newPlPrincipal = calculatePV(plRateM, 60, maxPlInstallment);
                stockPortfolio += newPlPrincipal;
                portfolioCostBasis += newPlPrincipal; // Added to cost basis
                
                currentMortInstallment = calculatePMT(mortRateM, remainingMortMonths, mortBalance);
                let leftoverDbr = DBR - currentMortInstallment;
                
                if (maxPlInstallment > leftoverDbr) {
                    currentPLInstallment = leftoverDbr;
                    newPlPrincipal = calculatePV(plRateM, 60, currentPLInstallment);
                } else {
                    currentPLInstallment = maxPlInstallment;
                }
                
                notes.push(`<span class="badge purple">استثمار مكثف</span> العقار للثلث، ضخ القرض الشخصي (${fmt(newPlPrincipal)}) بالأسهم.`);
            } else {
                // 2. Aggressive payout phase: Crush the mortgage!
                let maxPlPrincipal = calculatePV(plRateM, 60, maxPlInstallment);
                let totalAvailable = stockPortfolio + maxPlPrincipal;
                let minPossibleMortBalance = mortBalance - totalAvailable;
                
                if (minPossibleMortBalance <= 0) {
                    // Pay off entirely
                    stockPortfolio = Math.abs(minPossibleMortBalance);
                    mortBalance = 0;
                    currentMortInstallment = 0;
                    currentPLInstallment = maxPlInstallment;
                    notes.push(`<span class="badge purple">تكتيك: إنهاء العقار</span> سداد بالكامل! تبقى ${fmt(stockPortfolio)} بالمحفظة`);
                } else {
                    let resultingMortInstallment = calculatePMT(mortRateM, remainingMortMonths, minPossibleMortBalance);
                    let allowedMortInstallment = DBR - maxPlInstallment;
                    
                    if (resultingMortInstallment <= allowedMortInstallment) {
                        // Can afford with max PL
                        let neededBalToFitDbr = calculatePV(mortRateM, remainingMortMonths, allowedMortInstallment);
                        let targetBal = Math.max(targetThreshold, neededBalToFitDbr);
                        let amountToPay = mortBalance - targetBal;
                        
                        let takenFromStock = Math.min(amountToPay, stockPortfolio);
                        
                        // Proportional cost basis reduction
                        let sellRatio = (stockPortfolio > 0) ? (takenFromStock / stockPortfolio) : 0;
                        portfolioCostBasis -= (portfolioCostBasis * sellRatio);
                        stockPortfolio -= takenFromStock;
                        
                        let takenFromPL = amountToPay - takenFromStock;
                        let leftoverPl = maxPlPrincipal - takenFromPL;
                        stockPortfolio += leftoverPl;
                        portfolioCostBasis += leftoverPl; // PL injection is cost basis
                        
                        mortBalance -= amountToPay;
                        currentMortInstallment = calculatePMT(mortRateM, remainingMortMonths, mortBalance);
                        currentPLInstallment = maxPlInstallment;
                        
                        notes.push(`<span class="badge purple">تكتيك: إعادة جدولة</span> سداد ${fmt(amountToPay)} للعقار.`);
                    } else {
                        // Dynamic PL sizing (Algebra) to specifically max out 55% DBR
                        let pvMortFactor = calculatePV(mortRateM, remainingMortMonths, 1);
                        let pvPlFactor = calculatePV(plRateM, 60, 1);
                        
                        let x = (mortBalance - stockPortfolio - (pvMortFactor * DBR)) / (pvPlFactor - pvMortFactor);
                        
                        if (x < 0) x = 0;
                        if (x > maxPlInstallment) x = maxPlInstallment;
                        
                        let actualPlPrincipal = calculatePV(plRateM, 60, x);
                        let actualAmountToPay = stockPortfolio + actualPlPrincipal;
                        
                        let oldStock = stockPortfolio;
                        mortBalance -= actualAmountToPay;
                        stockPortfolio = 0; // Dumped completely
                        portfolioCostBasis = 0; // Reset cost basis
                        
                        currentPLInstallment = x;
                        currentMortInstallment = calculatePMT(mortRateM, remainingMortMonths, mortBalance);
                        
                        notes.push(`<span class="badge purple">سداد أقصى</span> تفريغ المحفظة (${fmt(oldStock)}) + شخصي (${fmt(actualPlPrincipal)}) لسحق العقار`);
                    }
                }
            }
        }
        
        // Benjamin Cowen Crypto Cycle
        let yearCycleStatus = '';
        
        if (useCrypto) {
            let currentCyclePhase = ((cycleStart - 1 + year - 1) % 4) + 1;
            let cycleParams = {
                1: { title: '🔴 قاع وتجميع', short: 'Bear', ret: -0.60 },
                2: { title: '🟡 تعافي (Recovery)', short: 'Recovery', ret: 0.40 },
                3: { title: '🟢 صعود (Mid Bull)', short: 'Mid Bull', ret: 1.00 },
                4: { title: '🔥 قمة ونشوة (Peak)', short: 'Bull Peak', ret: 2.00 }
            };
            let phaseInfo = cycleParams[currentCyclePhase];
            yearCycleStatus = phaseInfo.title;
            let monthlyCryptoRet = (Math.pow(1 + phaseInfo.ret, 1/12)) - 1;
            
            for (let m = 1; m <= 12; m++) {
                if (mortBalance > 0) {
                    let mInterest = mortBalance * mortRateM;
                    let mPrincipal = currentMortInstallment - mInterest;
                    mortBalance -= mPrincipal;
                    if (mortBalance < 0) mortBalance = 0;
                }
                stockPortfolio += monthlyInvestment;
                portfolioCostBasis += monthlyInvestment;
                stockPortfolio = stockPortfolio * (1 + monthlyCryptoRet);
            }
            
            // Year 4: Article 18 Tactical restructuring
            if (currentCyclePhase === 4 && mortBalance > 0 && isMilestoneYear) {
                // Done through aggressive milestone logic already!
            }
        } else {
            // Traditional stock simulation
            for (let m = 1; m <= 12; m++) {
                if (mortBalance > 0) {
                    let mInterest = mortBalance * mortRateM;
                    let mPrincipal = currentMortInstallment - mInterest;
                    mortBalance -= mPrincipal;
                    if (mortBalance < 0) mortBalance = 0;
                }
                stockPortfolio += monthlyInvestment;
                portfolioCostBasis += monthlyInvestment;
                stockPortfolio = stockPortfolio * (1 + stockRateM);
            }
        }
        
        if (year === 1) notes.push(`<span class="badge">بداية الخطة</span> قرض شخصي ${fmt(pl1Principal)} + دعم سكني ${fmt(sakaniSupport)}`);
        
        // Dividend income as real salary (YoC = based on cost basis!)
        let monthlyDividendIncome = (portfolioCostBasis * stockDiv) / 12;
        
        // Reinvest Divs (DRIP) if not needed for living
        // stockPortfolio += (monthlyDividendIncome * 12);
        // portfolioCostBasis += (monthlyDividendIncome * 12);
        
        lastDividendMonthly = monthlyDividendIncome;
        
        if (monthlyDividendIncome > 50) {
            notes.push(`<span class="badge" style="background:rgba(16,185,129,0.2);color:#10b981;">💰 توزيعات</span> + ${fmt(monthlyDividendIncome)}/شهر`);
        }
        
        let remainingLiving = currentSalary + monthlyDividendIncome - currentPLInstallment - currentMortInstallment - monthlyInvestment;
        if (mortBalance <= 0) { currentMortInstallment = 0; mortBalance = 0; }
        if ((year - 1) % 5 === 4) currentPLInstallment = 0;
        
        // Build row
        let phaseIndex = Math.ceil(year / 5);
        let plRemaining = currentPLInstallment > 0 ? calculatePV(plRateM, 60 - 12 * (year % 5 === 0 ? 5 : year % 5), currentPLInstallment) : 0;
        
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${year}</strong></td>
            ${useCrypto ? `<td style="font-size:0.82rem;font-weight:700;color:var(--bitcoin);">${yearCycleStatus}</td>` : ''}
            <td>${fmt(currentSalary)}</td>
            <td style="color:var(--secondary);font-weight:600;">${fmt(monthlyDividendIncome)}</td>
            <td>${currentPLInstallment > 0 ? fmt(currentPLInstallment) : '—'}</td>
            <td>${currentMortInstallment > 0 ? fmt(currentMortInstallment) : '—'}</td>
            <td style="font-weight:700;">${fmt(remainingLiving)}</td>
            <td>${mortBalance > 0 ? fmt(mortBalance) : '<span style="color:var(--secondary);font-weight:700;">✅ مسدد</span>'}</td>
            <td style="color:var(--secondary);font-weight:700;">${fmt(stockPortfolio)}<br><small style="font-size:0.7rem;color:var(--text-muted);">(ت. الأساس: ${fmt(portfolioCostBasis)})</small></td>
            <td class="td-notes">${notes.join('<br>')}</td>
        `;
        document.getElementById(`tbody-phase-${phaseIndex}`).appendChild(tr);
        
        // Phase alert (update on first year of each phase)
        if (year === (phaseIndex - 1) * 5 + 1) {
            document.getElementById(`alert-phase-${phaseIndex}`).innerHTML = getPhaseDescription(
                phaseIndex, useCrypto, currentSalary, mortBalance, stockPortfolio,
                currentPLInstallment, currentMortInstallment, totalMortPrincipal
            );
        }
    }
    
    // Final summary
    document.getElementById('summary-wealth').innerText = fmt(stockPortfolio);
    document.getElementById('summary-dividend').innerText = fmt(lastDividendMonthly) + ' /شهر';
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('legend-section').classList.remove('hidden');
    
    // Scroll to results if table is generated newly (disabled on slider slide to prevent jumping)
    if(e && e.type === 'submit') {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Auto-run on load
runSimulation(); 
// Prevent form submit if user clicks enter inside
document.getElementById('simulator-form').addEventListener('submit', runSimulation);
document.getElementById('simulator-form').dispatchEvent(new Event('submit', { cancelable: true }));