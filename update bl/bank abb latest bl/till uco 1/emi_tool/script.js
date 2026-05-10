document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanAmountValue = document.getElementById('loanAmountValue');

    const interestRateSlider = document.getElementById('interestRateSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateValue = document.getElementById('interestRateValue');

    const loanTenureSlider = document.getElementById('loanTenureSlider');
    const loanTenureInput = document.getElementById('loanTenureInput');
    const loanTenureValue = document.getElementById('loanTenureValue');
    const tenureSuffix = document.getElementById('tenureSuffix');
    const tenureToggleBtns = document.querySelectorAll('.toggle-btn');

    const monthlyEMI = document.getElementById('monthlyEMI');
    const totalPrincipal = document.getElementById('totalPrincipal');
    const totalInterest = document.getElementById('totalInterest');
    const totalAmount = document.getElementById('totalAmount');

    const viewDetailsBtn = document.getElementById('viewDetailsBtn');
    const detailsSection = document.getElementById('detailsSection');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const amortizationBody = document.getElementById('amortizationBody');
    const resetBtn = document.getElementById('resetBtn');

    let currentTenureUnit = 'years';
    let emiChart;

    // Initialization
    initChart();
    updateCalculator();

    // Event Listeners
    loanAmountSlider.addEventListener('input', (e) => {
        loanAmountInput.value = e.target.value;
        updateCalculator();
    });
    loanAmountInput.addEventListener('input', (e) => {
        loanAmountSlider.value = e.target.value;
        updateCalculator();
    });

    interestRateSlider.addEventListener('input', (e) => {
        interestRateInput.value = e.target.value;
        updateCalculator();
    });
    interestRateInput.addEventListener('input', (e) => {
        interestRateSlider.value = e.target.value;
        updateCalculator();
    });

    loanTenureSlider.addEventListener('input', (e) => {
        loanTenureInput.value = e.target.value;
        updateCalculator();
    });
    loanTenureInput.addEventListener('input', (e) => {
        loanTenureSlider.value = e.target.value;
        updateCalculator();
    });

    tenureToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tenureToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTenureUnit = btn.dataset.unit;
            
            // Adjust slider range based on unit
            if (currentTenureUnit === 'years') {
                loanTenureSlider.min = 1;
                loanTenureSlider.max = 30;
                tenureSuffix.innerText = 'Years';
            } else {
                loanTenureSlider.min = 1;
                loanTenureSlider.max = 360;
                tenureSuffix.innerText = 'Months';
            }
            updateCalculator();
        });
    });

    viewDetailsBtn.addEventListener('click', () => {
        detailsSection.style.display = 'block';
        detailsSection.scrollIntoView({ behavior: 'smooth' });
    });

    closeDetailsBtn.addEventListener('click', () => {
        detailsSection.style.display = 'none';
    });

    resetBtn.addEventListener('click', () => {
        loanAmountInput.value = 1000000;
        loanAmountSlider.value = 1000000;
        interestRateInput.value = 10.5;
        interestRateSlider.value = 10.5;
        loanTenureInput.value = 5;
        loanTenureSlider.value = 5;
        updateCalculator();
    });

    // Core Logic
    function updateCalculator() {
        const principal = parseFloat(loanAmountInput.value);
        const annualRate = parseFloat(interestRateInput.value);
        const tenureValue = parseFloat(loanTenureInput.value);

        loanAmountValue.innerText = formatCurrency(principal).replace('₹', '');
        interestRateValue.innerText = annualRate;
        loanTenureValue.innerText = tenureValue;

        const months = currentTenureUnit === 'years' ? tenureValue * 12 : tenureValue;
        const monthlyRate = annualRate / 12 / 100;

        // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = emi * months;
        const totalInterestPaid = totalPayment - principal;

        // Update UI
        monthlyEMI.innerText = formatCurrency(Math.round(emi));
        totalPrincipal.innerText = formatCurrency(principal);
        totalInterest.innerText = formatCurrency(Math.round(totalInterestPaid));
        totalAmount.innerText = formatCurrency(Math.round(totalPayment));

        updateChart(principal, totalInterestPaid);
        generateAmortizationSchedule(principal, monthlyRate, emi, months);
    }

    function generateAmortizationSchedule(principal, monthlyRate, emi, totalMonths) {
        let balance = principal;
        let html = '';

        for (let i = 1; i <= totalMonths; i++) {
            const interest = balance * monthlyRate;
            const principalPaid = emi - interest;
            balance -= principalPaid;

            html += `
                <tr>
                    <td>${i}</td>
                    <td>${formatCurrency(Math.round(principalPaid))}</td>
                    <td>${formatCurrency(Math.round(interest))}</td>
                    <td>${formatCurrency(Math.round(emi))}</td>
                    <td>${formatCurrency(Math.max(0, Math.round(balance)))}</td>
                </tr>
            `;
        }
        amortizationBody.innerHTML = html;
    }

    function initChart() {
        const ctx = document.getElementById('emiChart').getContext('2d');
        emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [1, 1],
                    backgroundColor: ['#10B981', '#F59E0B'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                cutout: '80%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function updateChart(principal, interest) {
        emiChart.data.datasets[0].data = [principal, interest];
        emiChart.update();
    }

    function formatCurrency(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }
});
