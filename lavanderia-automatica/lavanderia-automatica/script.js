document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos da Tela ---
    const loginForm = document.getElementById('login-form');
    const mainApp = document.getElementById('main-app');
    const loginFormElement = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    const clientNameInput = document.getElementById('clientName');
    const clientPhoneInput = document.getElementById('clientPhone');
    const findClientBtn = document.getElementById('findClientBtn');
    const clientInfo = document.getElementById('clientInfo');

    const itemTypeSelect = document.getElementById('itemType');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsTableBody = document.getElementById('itemsTableBody');

    const subtotalValueSpan = document.getElementById('subtotalValue');
    const discountDisplay = document.getElementById('discountDisplay');
    const discountValueSpan = document.getElementById('discountValue');
    const totalValueSpan = document.getElementById('totalValue');
    const finalizeOrderBtn = document.getElementById('finalizeOrderBtn');

    // --- Estado da Aplicação (simulando o backend) ---
    let currentUser = null;
    let currentClient = null;
    let currentOrder = {
        client: null,
        items: [],
        subtotal: 0.0,
        discount: 0.0,
        total: 0.0
    };
    

    let clientsDB = {
        "1199998888": { name: "João Silva", orderCount: 5 }, // Cliente fiel
        "1188887777": { name: "Maria Souza", orderCount: 2 }
    };

    const prices = {
        "Camisa": { "Lavar": 5.00, "Secar": 4.00, "Passar": 6.00, "Pacote Completo": 12.00 },
        "Calça": { "Lavar": 7.00, "Secar": 5.00, "Passar": 7.00, "Pacote Completo": 15.00 },
        "Toalha": { "Lavar": 4.00, "Secar": 3.50, "Passar": 0.00, "Pacote Completo": 6.00 },
        "Roupa Delicada": { "Lavar": 10.00, "Secar": 8.00, "Passar": 12.00, "Pacote Completo": 25.00 },
    };

    // --- Lógica de Login ---
    loginFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Credenciais fixas para exemplo
        if (username === 'atendente' && password === '12345') {
            currentUser = username;
            loginForm.classList.add('hidden');
            mainApp.classList.remove('hidden');
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Usuário ou senha incorretos.';
        }
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        mainApp.classList.add('hidden');
        loginForm.classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        resetOrder();
    });

    // --- Lógica de Cliente ---
    findClientBtn.addEventListener('click', () => {
        const phone = clientPhoneInput.value;
        if (!phone) {
            clientInfo.textContent = 'Por favor, informe o telefone do cliente.';
            clientInfo.className = 'error-message';
            return;
        }

        if (clientsDB[phone]) {
            currentClient = { ...clientsDB[phone], phone: phone };
            clientNameInput.value = currentClient.name;
            clientInfo.textContent = `Cliente encontrado: ${currentClient.name}`;
            clientInfo.className = 'info-message';
        } else {
            // Simula cadastro de novo cliente
            currentClient = { name: clientNameInput.value, phone: phone, orderCount: 0 };
            clientsDB[phone] = { name: currentClient.name, orderCount: 0 };
            clientInfo.textContent = `Novo cliente ${currentClient.name} cadastrado com sucesso!`;
            clientInfo.className = 'info-message';
        }
        currentOrder.client = currentClient;
    });

    // --- Lógica de Itens do Pedido ---
    addItemBtn.addEventListener('click', () => {
        const type = itemTypeSelect.value;
        const quantity = parseInt(itemQuantityInput.value);
        const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
        const services = Array.from(serviceCheckboxes).map(cb => cb.value);

        if (!type || !quantity || services.length === 0) {
            alert('Por favor, preencha todos os campos do item.');
            return;
        }

        const item = { type, quantity, services };
        currentOrder.items.push(item);
        
        updateItemsTable();
        calculateTotal();

        // Limpa campos do item
        itemTypeSelect.value = '';
        itemQuantityInput.value = '1';
        serviceCheckboxes.forEach(cb => cb.checked = false);
    });

    function updateItemsTable() {
        itemsTableBody.innerHTML = '';
        currentOrder.items.forEach(item => {
            const row = itemsTableBody.insertRow();
            row.insertCell(0).textContent = `${item.quantity}x ${item.type}`;
            row.insertCell(1).textContent = item.services.join(', ');
            row.insertCell(2).textContent = `R$ ${calculateItemSubtotal(item).toFixed(2)}`;
        });
    }

    function calculateItemSubtotal(item) {
        let price = 0;
        if (item.services.includes('Pacote Completo')) {
            price = prices[item.type]['Pacote Completo'];
        } else {
            item.services.forEach(service => {
                price += prices[item.type][service];
            });
        }
        return price * item.quantity;
    }

    function calculateTotal() {
        currentOrder.subtotal = currentOrder.items.reduce((total, item) => total + calculateItemSubtotal(item), 0);
        currentOrder.discount = 0.0;

        // Lógica de Desconto de Fidelidade (UC-05)
        if ((currentOrder.client.orderCount + 1) % 6 === 0) {
            currentOrder.discount = 0.15; // 15%
        }

        currentOrder.total = currentOrder.subtotal * (1 - currentOrder.discount);

        // Atualiza a tela
        subtotalValueSpan.textContent = currentOrder.subtotal.toFixed(2);
        if (currentOrder.discount > 0) {
            discountDisplay.classList.remove('hidden');
            discountValueSpan.textContent = (currentOrder.discount * 100).toFixed(0);
        } else {
            discountDisplay.classList.add('hidden');
        }
        totalValueSpan.textContent = currentOrder.total.toFixed(2);
    }
    
    // --- Finalizar Pedido ---
    finalizeOrderBtn.addEventListener('click', () => {
        if (!currentOrder.client || currentOrder.items.length === 0) {
            alert('Não é possível finalizar. Verifique os dados do cliente e adicione itens ao pedido.');
            return;
        }

        // Simula o salvamento do pedido
        clientsDB[currentOrder.client.phone].orderCount++;
        
        alert(`Pedido finalizado com sucesso!\n\nCliente: ${currentOrder.client.name}\nValor Total: R$ ${currentOrder.total.toFixed(2)}\n${currentOrder.discount > 0 ? 'Desconto de Fidelidade aplicado!' : ''}`);
        
        resetOrder();
    });

    function resetOrder() {
        currentOrder = { client: null, items: [], subtotal: 0.0, discount: 0.0, total: 0.0 };
        currentClient = null;
        clientNameInput.value = '';
        clientPhoneInput.value = '';
        clientInfo.textContent = '';
        updateItemsTable();
        calculateTotal();
    }
});