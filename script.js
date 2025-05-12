// Constantes do Sistema
const STATUS = {
    PAGO: 'paid',
    PENDENTE: 'pending',
    ATRASADO: 'overdue'
};

// Textos padronizados
const TEXTOS = {
    ERRO_LOGIN: 'Erro ao fazer login. Por favor, tente novamente.',
    CAMPOS_OBRIGATORIOS: 'Por favor, preencha todos os campos.',
    SELECIONE_METODO: 'Por favor, selecione um método de pagamento.',
    PAGAMENTO_SUCESSO: 'Pagamento realizado com sucesso!',
    ERRO_PAGAMENTO: 'Erro ao processar pagamento. Por favor, tente novamente.',
    NENHUM_PAGAMENTO: 'Nenhum pagamento encontrado',
    SELECIONE_VEICULO: 'Selecione um veículo para visualizar os pagamentos'
};

// Módulo de Utilitários
const Utils = {
    formatarData: (dataString) => {
        if (!dataString) return '--/--/----';
        const [dia, mes, ano] = dataString.split('/');
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    },

    formatarMoeda: (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    obterNomeMetodoPagamento: (metodo) => {
        const metodos = {
            'credit': 'Cartão de Crédito',
            'debit': 'Cartão de Débito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário'
        };
        return metodos[metodo] || 'Não especificado';
    },

    mostrarModalGenerico: (titulo, mensagem) => {
        document.getElementById('generic-modal-title').textContent = titulo;
        document.getElementById('generic-modal-message').textContent = mensagem;
        document.getElementById('generic-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

// Módulo de Serviços (simulação de API)
const ApiService = {
    login: async (email, senha) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.user);
            }, 500);
        });
    },

    obterVeiculos: async (usuarioId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(sampleData.vehicles);
            }, 500);
        });
    },

    processarPagamento: async (pagamentoId, metodo) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    pagamentoId,
                    metodo,
                    dataPagamento: new Date().toLocaleDateString('pt-BR')
                });
            }, 1000);
        });
    }
};

// Módulo de Gerenciamento de Estado
const GerenciadorEstado = {
    usuarioAtual: null,
    veiculoSelecionado: null,
    pagamentoSelecionado: null,
    metodoPagamentoSelecionado: null,

    definirUsuarioAtual: function(usuario) {
        this.usuarioAtual = usuario;
        this.atualizarUI();
    },

    definirVeiculoSelecionado: function(veiculo) {
        this.veiculoSelecionado = veiculo;
    },

    definirPagamentoSelecionado: function(pagamento) {
        this.pagamentoSelecionado = pagamento;
    },

    definirMetodoPagamentoSelecionado: function(metodo) {
        this.metodoPagamentoSelecionado = metodo;
    },

    atualizarUI: function() {
        if (this.usuarioAtual) {
            document.getElementById('user-name').textContent = this.usuarioAtual.name;
            document.getElementById('user-avatar').textContent = this.usuarioAtual.avatarInitials;
        }
    },

    resetar: function() {
        this.usuarioAtual = null;
        this.veiculoSelecionado = null;
        this.pagamentoSelecionado = null;
        this.metodoPagamentoSelecionado = null;
    }
};

// Módulo de Interface do Usuário
const UI = {
    inicializar: function() {
        this.configurarEventListeners();
        document.getElementById('app-section').style.display = 'none';
    },

    configurarEventListeners: function() {
        // Formulário de login
        document.getElementById('login-form').addEventListener('submit', (e) => this.tratarLogin(e));
        
        // Botão de logout
        document.getElementById('logout-btn').addEventListener('click', () => this.tratarLogout());
        
        // Botão de voltar
        document.getElementById('back-btn').addEventListener('click', () => this.mostrarSecaoVeiculos());
        
        // Abas de pagamentos
        document.querySelectorAll('.payment-tab').forEach(aba => {
            aba.addEventListener('click', () => {
                this.alternarAbaPagamentos(aba.dataset.tab);
            });
        });
        
        // Modal de pagamento
        document.getElementById('close-modal').addEventListener('click', () => this.fecharModalPagamento());
        document.getElementById('cancel-payment').addEventListener('click', () => this.fecharModalPagamento());
        document.getElementById('confirm-payment').addEventListener('click', () => this.confirmarPagamento());
        
        // Opções de método de pagamento
        document.querySelectorAll('.payment-method-option').forEach(opcao => {
            opcao.addEventListener('click', () => {
                this.selecionarMetodoPagamento(opcao.dataset.method);
            });
        });
        
        // Modal de detalhes
        document.getElementById('close-details-modal').addEventListener('click', () => this.fecharModalDetalhes());
        document.getElementById('close-details-btn').addEventListener('click', () => this.fecharModalDetalhes());
        
        // Modal genérico
        document.getElementById('close-generic-modal').addEventListener('click', () => this.fecharModalGenerico());
        document.getElementById('confirm-generic-modal').addEventListener('click', () => this.fecharModalGenerico());

        // Delegação de eventos para os botões dinâmicos
        document.addEventListener('click', (e) => {
            // Botão Pagar
            if (e.target.closest('.pay-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.pay-btn');
                const pagamentoId = parseInt(btn.dataset.id);
                const pagamento = this.encontrarPagamentoPorId(pagamentoId);
                if (pagamento) {
                    this.abrirModalPagamento(pagamento);
                }
            }
            
            // Botão Detalhes
            if (e.target.closest('.details-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.details-btn');
                const pagamentoId = parseInt(btn.dataset.id);
                const pagamento = this.encontrarPagamentoPorId(pagamentoId);
                if (pagamento) {
                    this.abrirModalDetalhes(pagamento);
                }
            }
        });
    },

    tratarLogin: async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value.trim();
        
        if (!email || !senha) {
            Utils.mostrarModalGenerico('Atenção', TEXTOS.CAMPOS_OBRIGATORIOS);
            return;
        }

        try {
            const usuario = await ApiService.login(email, senha);
            GerenciadorEstado.definirUsuarioAtual(usuario);
            
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            
            await this.carregarVeiculos();
        } catch (erro) {
            console.error('Erro no login:', erro);
            Utils.mostrarModalGenerico('Erro', TEXTOS.ERRO_LOGIN);
        }
    },

    tratarLogout: function() {
        GerenciadorEstado.resetar();
        document.getElementById('login-form').reset();
        document.getElementById('app-section').style.display = 'none';
        document.getElementById('auth-section').style.display = 'flex';
    },

    carregarVeiculos: async function() {
        const gridVeiculos = document.getElementById('vehicles-grid');
        gridVeiculos.innerHTML = '';
        
        try {
            const veiculos = await ApiService.obterVeiculos(GerenciadorEstado.usuarioAtual.id);
            
            veiculos.forEach(veiculo => {
                const cardVeiculo = this.criarCardVeiculo(veiculo);
                gridVeiculos.appendChild(cardVeiculo);
            });
        } catch (erro) {
            console.error('Erro ao carregar veículos:', erro);
            Utils.mostrarModalGenerico('Erro', 'Erro ao carregar veículos. Por favor, tente novamente.');
        }
    },

    criarCardVeiculo: function(veiculo) {
        const card = document.createElement('div');
        card.className = 'vehicle-card fade-in';
        card.dataset.id = veiculo.id;
        
        const estatisticas = this.calcularEstatisticasPagamentos(veiculo.payments);
        
        card.innerHTML = `
            <div class="vehicle-image" style="background-image: url('${veiculo.image}')">
                <span class="vehicle-badge">${veiculo.plate}</span>
            </div>
            <div class="vehicle-content">
                <h3 class="vehicle-title">${veiculo.brand} ${veiculo.model} ${veiculo.year}</h3>
                <div class="vehicle-meta">
                    <span>${veiculo.status === 'active' ? 'Aluguel ativo' : 'Aluguel finalizado'}</span>
                    <div class="payment-status">
                        <span class="status-indicator ${this.obterClasseIndicadorStatus(estatisticas)}"></span>
                        <span>${estatisticas.pagos}/${veiculo.payments.length} pagos</span>
                    </div>
                </div>
                <div class="vehicle-period">
                    ${Utils.formatarData(veiculo.rentalStart)} - ${Utils.formatarData(veiculo.rentalEnd)}
                </div>
                ${estatisticas.atrasados > 0 ? 
                    `<div class="alert-atraso">
                        ${estatisticas.atrasados} pagamento(s) atrasado(s)
                    </div>` : ''
                }
            </div>
        `;
        
        card.addEventListener('click', () => this.mostrarPagamentos(veiculo));
        return card;
    },

    mostrarPagamentos: function(veiculo) {
        GerenciadorEstado.definirVeiculoSelecionado(veiculo);
        
        document.getElementById('payment-vehicle-title').textContent = `Pagamentos - ${veiculo.brand} ${veiculo.model}`;
        document.getElementById('vehicles-section').style.display = 'none';
        document.getElementById('payments-section').style.display = 'block';
        
        this.carregarPagamentos(veiculo.payments);
        this.alternarAbaPagamentos('all');
    },

    mostrarSecaoVeiculos: function() {
        document.getElementById('payments-section').style.display = 'none';
        document.getElementById('vehicles-section').style.display = 'block';
    },

    carregarPagamentos: function(pagamentos) {
        const listasPagamentos = {
            all: document.getElementById('all-payments'),
            pending: document.getElementById('pending-payments'),
            paid: document.getElementById('paid-payments'),
            overdue: document.getElementById('overdue-payments')
        };
        
        // Limpa as listas
        Object.values(listasPagamentos).forEach(lista => {
            lista.innerHTML = '';
            
            if (pagamentos.length === 0) {
                const mensagemVazia = document.createElement('div');
                mensagemVazia.className = 'text-center mb-3 mt-3';
                mensagemVazia.textContent = TEXTOS.NENHUM_PAGAMENTO;
                lista.appendChild(mensagemVazia);
            }
        });
        
        // Preenche as listas
        pagamentos.forEach(pagamento => {
            const itemPagamento = this.criarItemPagamento(pagamento);
            
            listasPagamentos.all.appendChild(itemPagamento.cloneNode(true));
            
            if (pagamento.status === STATUS.PENDENTE) {
                listasPagamentos.pending.appendChild(itemPagamento.cloneNode(true));
            } else if (pagamento.status === STATUS.PAGO) {
                listasPagamentos.paid.appendChild(itemPagamento.cloneNode(true));
            } else if (pagamento.status === STATUS.ATRASADO) {
                listasPagamentos.overdue.appendChild(itemPagamento.cloneNode(true));
            }
        });
    },

    criarItemPagamento: function(pagamento) {
        const item = document.createElement('div');
        item.className = 'payment-item fade-in';
        
        let classeStatus, textoStatus;
        if (pagamento.status === STATUS.PAGO) {
            classeStatus = 'status-paid';
            textoStatus = `Pago em ${Utils.formatarData(pagamento.paidDate)}`;
        } else if (pagamento.status === STATUS.PENDENTE) {
            classeStatus = 'status-pending';
            textoStatus = 'Pendente';
        } else if (pagamento.status === STATUS.ATRASADO) {
            classeStatus = 'status-overdue';
            textoStatus = 'Atrasado';
        }
        
        item.innerHTML = `
            <div class="payment-info">
                <div class="payment-id">${pagamento.description}</div>
                <div class="payment-details">
                    Vencimento: ${Utils.formatarData(pagamento.dueDate)} | 
                    ID: ${pagamento.id}
                </div>
            </div>
            <div class="payment-amount">${Utils.formatarMoeda(pagamento.amount)}</div>
            <div class="payment-status-badge ${classeStatus}">${textoStatus}</div>
            <div class="payment-actions">
                ${pagamento.status !== STATUS.PAGO ? 
                    `<button class="btn btn-success btn-sm pay-btn" data-id="${pagamento.id}" title="Efetuar pagamento">
                        <i class="fas fa-money-bill-wave"></i> Pagar
                    </button>` : ''
                }
                <button class="btn btn-primary btn-sm details-btn" data-id="${pagamento.id}" title="Ver detalhes">
                    <i class="fas fa-info-circle"></i> Detalhes
                </button>
            </div>
        `;
        
        return item;
    },

    encontrarPagamentoPorId: function(pagamentoId) {
        if (!GerenciadorEstado.veiculoSelecionado) return null;
        return GerenciadorEstado.veiculoSelecionado.payments.find(p => p.id === pagamentoId);
    },

    alternarAbaPagamentos: function(nomeAba) {
        document.querySelectorAll('.payment-tab').forEach(aba => {
            aba.classList.toggle('active', aba.dataset.tab === nomeAba);
        });
        
        ['all', 'pending', 'paid', 'overdue'].forEach(chave => {
            document.getElementById(`${chave}-payments`).classList.toggle('active', chave === nomeAba);
        });
    },

    abrirModalPagamento: function(pagamento) {
        if (!pagamento) return;
        
        GerenciadorEstado.definirPagamentoSelecionado(pagamento);
        GerenciadorEstado.definirMetodoPagamentoSelecionado(null);
        
        document.getElementById('modal-title').textContent = `Pagar ${pagamento.description}`;
        document.querySelectorAll('.payment-method-option').forEach(opcao => {
            opcao.classList.remove('selected');
        });
        
        document.getElementById('confirm-payment').disabled = true;
        
        const valorTotal = pagamento.status === STATUS.ATRASADO ? 
            pagamento.amount + (pagamento.lateFee || 0) : 
            pagamento.amount;
        
        document.getElementById('payment-details').innerHTML = `
            <div class="d-flex justify-between align-center mb-3">
                <div class="payment-detail">
                    <div class="payment-detail-label">Valor Original</div>
                    <div class="payment-detail-value">
                        ${Utils.formatarMoeda(pagamento.amount)}
                    </div>
                </div>
                ${pagamento.lateFee > 0 ? `
                <div class="payment-detail">
                    <div class="payment-detail-label">Multa por Atraso</div>
                    <div class="payment-detail-value text-danger">
                        + ${Utils.formatarMoeda(pagamento.lateFee)}
                    </div>
                </div>
                ` : ''}
                ${pagamento.discount > 0 ? `
                <div class="payment-detail">
                    <div class="payment-detail-label">Desconto</div>
                    <div class="payment-detail-value text-success">
                        - ${Utils.formatarMoeda(pagamento.discount)}
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="payment-detail">
                <div class="payment-detail-label">Total a Pagar</div>
                <div class="payment-detail-value total-amount">
                    ${Utils.formatarMoeda(valorTotal)}
                </div>
            </div>
        `;
        
        document.getElementById('payment-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    fecharModalPagamento: function() {
        document.getElementById('payment-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    selecionarMetodoPagamento: function(metodo) {
        GerenciadorEstado.definirMetodoPagamentoSelecionado(metodo);
        
        document.querySelectorAll('.payment-method-option').forEach(opcao => {
            opcao.classList.toggle('selected', opcao.dataset.method === metodo);
        });
        
        document.getElementById('confirm-payment').disabled = false;
    },

    confirmarPagamento: async function() {
        if (!GerenciadorEstado.metodoPagamentoSelecionado) {
            Utils.mostrarModalGenerico('Atenção', TEXTOS.SELECIONE_METODO);
            return;
        }
        
        try {
            const resultado = await ApiService.processarPagamento(
                GerenciadorEstado.pagamentoSelecionado.id, 
                GerenciadorEstado.metodoPagamentoSelecionado
            );
            
            if (resultado.success) {
                GerenciadorEstado.pagamentoSelecionado.status = STATUS.PAGO;
                GerenciadorEstado.pagamentoSelecionado.paidDate = resultado.dataPagamento;
                GerenciadorEstado.pagamentoSelecionado.paymentMethod = GerenciadorEstado.metodoPagamentoSelecionado;
                
                this.carregarPagamentos(GerenciadorEstado.veiculoSelecionado.payments);
                this.fecharModalPagamento();
                
                Utils.mostrarModalGenerico('Sucesso', TEXTOS.PAGAMENTO_SUCESSO);
            }
        } catch (erro) {
            console.error('Erro no pagamento:', erro);
            Utils.mostrarModalGenerico('Erro', TEXTOS.ERRO_PAGAMENTO);
        }
    },

    abrirModalDetalhes: function(pagamento) {
        if (!pagamento) return;
        
        GerenciadorEstado.definirPagamentoSelecionado(pagamento);
        
        document.getElementById('payment-full-details').innerHTML = `
            <div class="payment-detail mb-3">
                <div class="payment-detail-label">Descrição</div>
                <div class="payment-detail-value">${pagamento.description}</div>
            </div>
            
            <div class="d-flex justify-between mb-3">
                <div class="payment-detail">
                    <div class="payment-detail-label">ID do Pagamento</div>
                    <div class="payment-detail-value">${pagamento.id}</div>
                </div>
                <div class="payment-detail">
                    <div class="payment-detail-label">Número da Fatura</div>
                    <div class="payment-detail-value">${pagamento.invoiceNumber}</div>
                </div>
            </div>
            
            <div class="d-flex justify-between mb-3">
                <div class="payment-detail">
                    <div class="payment-detail-label">Data de Vencimento</div>
                    <div class="payment-detail-value">${Utils.formatarData(pagamento.dueDate)}</div>
                </div>
                <div class="payment-detail">
                    <div class="payment-detail-label">Status</div>
                    <div class="payment-detail-value">
                        <span class="payment-status-badge ${pagamento.status === STATUS.PAGO ? 'status-paid' : 
                            pagamento.status === STATUS.PENDENTE ? 'status-pending' : 'status-overdue'}">
                            ${pagamento.status === STATUS.PAGO ? 'Pago' : 
                             pagamento.status === STATUS.PENDENTE ? 'Pendente' : 'Atrasado'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="payment-detail mb-3">
                <div class="payment-detail-label">Valor Original</div>
                <div class="payment-detail-value">
                    ${Utils.formatarMoeda(pagamento.amount)}
                </div>
            </div>
            
            ${pagamento.lateFee > 0 ? `
            <div class="payment-detail mb-3">
                <div class="payment-detail-label">Multa por Atraso</div>
                <div class="payment-detail-value text-danger">
                    ${Utils.formatarMoeda(pagamento.lateFee)}
                </div>
            </div>
            ` : ''}
            
            ${pagamento.discount > 0 ? `
            <div class="payment-detail mb-3">
                <div class="payment-detail-label">Desconto</div>
                <div class="payment-detail-value text-success">
                    ${Utils.formatarMoeda(pagamento.discount)}
                </div>
            </div>
            ` : ''}
            
            ${pagamento.status === STATUS.PAGO ? `
            <div class="d-flex justify-between mb-3">
                <div class="payment-detail">
                    <div class="payment-detail-label">Data do Pagamento</div>
                    <div class="payment-detail-value">${Utils.formatarData(pagamento.paidDate)}</div>
                </div>
                <div class="payment-detail">
                    <div class="payment-detail-label">Método de Pagamento</div>
                    <div class="payment-detail-value">
                        ${Utils.obterNomeMetodoPagamento(pagamento.paymentMethod)}
                    </div>
                </div>
            </div>
            
            <div class="payment-detail">
                <div class="payment-detail-label">Total Pago</div>
                <div class="payment-detail-value fw-600">
                    ${Utils.formatarMoeda(pagamento.amount + (pagamento.lateFee || 0) - (pagamento.discount || 0))}
                </div>
            </div>
            ` : ''}
        `;
        
        document.getElementById('details-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    },

    fecharModalDetalhes: function() {
        document.getElementById('details-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    fecharModalGenerico: function() {
        document.getElementById('generic-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    calcularEstatisticasPagamentos: function(pagamentos) {
        return {
            total: pagamentos.length,
            pagos: pagamentos.filter(p => p.status === STATUS.PAGO).length,
            pendentes: pagamentos.filter(p => p.status === STATUS.PENDENTE).length,
            atrasados: pagamentos.filter(p => p.status === STATUS.ATRASADO).length
        };
    },

    obterClasseIndicadorStatus: function(estatisticas) {
        if (estatisticas.atrasados > 0) return 'status-danger';
        if (estatisticas.pendentes > 0) return 'status-warning';
        return 'status-good';
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    UI.inicializar();
});