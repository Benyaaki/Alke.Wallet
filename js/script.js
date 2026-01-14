document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('walletBalance')) {
        localStorage.setItem('walletBalance', '5000');
    }

    updateBalanceDisplay();

    const loginForm = document.querySelector('form[action="menu.html"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email === 'test@gmail.com' && password === '123456') {
                window.location.href = 'menu.html';
            } else {
                alert('Credenciales inválidas. Intente test@gmail.com / 123456');
            }
        });
    }

    const depositButton = document.querySelector('button.btn-success');
    if (depositButton) {
        depositButton.addEventListener('click', function () {
            const amountInput = document.getElementById('amount');
            const amount = parseFloat(amountInput.value);

            if (amount > 0) {
                let currentBalance = parseFloat(localStorage.getItem('walletBalance'));
                currentBalance += amount;
                localStorage.setItem('walletBalance', currentBalance);

                saveTransaction('Depósito', amount, 'credit');

                alert('Depósito realizado con éxito. Nuevo saldo: $' + currentBalance);
                amountInput.value = '';
                updateBalanceDisplay();
            } else {
                alert('Por favor ingrese un monto válido.');
            }
        });
    }

    const transferButton = document.querySelector('button.btn-info');
    if (transferButton) {
        transferButton.addEventListener('click', function () {
            const amountInput = document.getElementById('amount');
            const amount = parseFloat(amountInput.value);
            const contactSelect = document.getElementById('contact');
            const contactValue = contactSelect.value;
            const contactName = contactSelect.options[contactSelect.selectedIndex].text;

            if (contactValue === "") {
                alert('Por favor seleccione un contacto.');
                return;
            }

            if (amount > 0) {
                let currentBalance = parseFloat(localStorage.getItem('walletBalance'));
                if (currentBalance >= amount) {
                    currentBalance -= amount;
                    localStorage.setItem('walletBalance', currentBalance);

                    saveTransaction('Transferencia a ' + contactName, amount, 'debit');

                    alert('Transferencia exitosa a ' + contactName + '. Nuevo saldo: $' + currentBalance);
                    amountInput.value = '';
                    updateBalanceDisplay();
                } else {
                    alert('Fondos insuficientes.');
                }
            } else {
                alert('Por favor ingrese un monto válido.');
            }
        });
    }

    loadTransactions();
});

function saveTransaction(description, amount, type) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const date = new Date().toISOString().split('T')[0];

    transactions.push({
        date: date,
        description: description,
        amount: amount,
        type: type
    });

    if (transactions.length > 10) {
        transactions.shift();
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const tableBody = document.getElementById('transactions-body');
    if (tableBody) {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        tableBody.innerHTML = '';

        if (transactions.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No hay movimientos recientes</td></tr>';
            return;
        }

        transactions.reverse().forEach(t => {
            const row = document.createElement('tr');
            const amountClass = t.type === 'credit' ? 'text-success' : 'text-danger';
            const sign = t.type === 'credit' ? '+' : '-';

            row.innerHTML = `
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td class="${amountClass} fw-bold">${sign} $${t.amount}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance-container');
    if (balanceElement) {
        let displayElement = balanceElement.querySelector('p.display-6') || balanceElement.querySelector('p');
        if (!displayElement && balanceElement.tagName === 'P') {
            displayElement = balanceElement;
        }

        if (displayElement) {
            const balance = localStorage.getItem('walletBalance');
            displayElement.textContent = '$' + balance;
            displayElement.classList.remove('text-success', 'text-danger');
            displayElement.classList.add('text-success');
        }
    }
}

$(document).ready(function () {
    $('main').hide().fadeIn(1000);

    const originalUpdateBalance = window.updateBalanceDisplay;
    window.updateBalanceDisplay = function () {
        const balanceElement = $('#balance-container p');
        const balance = localStorage.getItem('walletBalance');

        balanceElement.fadeOut(200, function () {
            $(this).text('$' + balance).fadeIn(200);
        });
    };

    $('#contact-search').on('keyup', function () {
        const value = $(this).val().toLowerCase();
        $('#contact-list li').filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $('#contact-list li').click(function () {
        const contactName = $(this).contents().get(0).nodeValue.trim();
        $('#contact option').filter(function () {
            return $(this).text().includes(contactName.split(' ')[0]);
        }).prop('selected', true);

        $('#contact-list li').removeClass('active');
        $(this).addClass('active');
    });
});
