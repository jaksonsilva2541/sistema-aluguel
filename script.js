// Constantes do Sistema
const STATUS = {
    PAGO: 'pago',
    PENDENTE: 'pendente',
    ATRASADO: 'atrasado'
};

// Textos padronizados
const TEXTOS = {
    ERRO_LOGIN: 'Erro ao fazer login. Por favor, tente novamente.',
    CAMPOS_OBRIGATORIOS: 'Por favor, preencha todos os campos.',
    SELECIONE_METODO: 'Por favor, selecione um método de pagamento.',
    PAGAMENTO_SUCESSO: 'Pagamento realizado com sucesso!',
    ERRO_PAGAMENTO: 'Erro ao processar pagamento. Por favor, tente novamente.',
    NENHUM_PAGAMENTO: 'Nenhum pagamento encontrado',
    SELECIONE_VEICULO: 'Selecione um veículo para visualizar os pagamentos',
    ERRO_CONEXAO: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
};

// Módulo de Utilitários
const Utils = {
    formatarData: (dataString) => {
        console.log('[Utils] Formatando data:', dataString);
        if (!dataString) {
            console.warn('[Utils] Data vazia recebida');
            return '--/--/----';
        }
        
        try {
            const [ano, mes, dia] = dataString.split('-');
            const dataFormatada = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
            console.log('[Utils] Data formatada:', dataFormatada);
            return dataFormatada;
        } catch (error) {
            console.error('[Utils] Erro ao formatar data:', error);
            return '--/--/----';
        }
    },

    formatarMoeda: (valor) => {
        console.log('[Utils] Formatando moeda:', valor);
        try {
            if (isNaN(valor)) {
                console.warn('[Utils] Valor não é um número');
                return 'R$ --,--';
            }
            return valor.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
        } catch (error) {
            console.error('[Utils] Erro ao formatar moeda:', error);
            return 'R$ --,--';
        }
    },

    obterNomeMetodoPagamento: (metodo) => {
        console.log('[Utils] Obtendo nome do método:', metodo);
        const metodos = {
            'credit': 'Cartão de Crédito',
            'debit': 'Cartão de Débito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário'
        };
        return metodos[metodo] || 'Não especificado';
    },

    mostrarModalGenerico: (titulo, mensagem) => {
        console.log(`[Utils] Mostrando modal: ${titulo} - ${mensagem}`);
        document.getElementById('generic-modal-title').textContent = titulo;
        document.getElementById('generic-modal-message').textContent = mensagem;
        document.getElementById('generic-modal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

// Módulo de Serviço API
const ApiService = {
    login: async (email, senha) => {
        console.group('[ApiService] Iniciando login');
        console.log('Credenciais recebidas:', { email: email?.substring(0, 3) + '...', senha: senha ? '***' : null });
        
        try {
            const inicioRequisicao = Date.now();
            console.log('[ApiService] Enviando requisição para /api/login');
            
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: email.trim(), 
                    senha: senha.trim()
                })
            });

            const tempoResposta = Date.now() - inicioRequisicao;
            console.log(`[ApiService] Resposta recebida em ${tempoResposta}ms`, response);

            if (!response.ok) {
                console.warn('[ApiService] Resposta não OK:', response.status);
                let errorData = {};
                try {
                    errorData = await response.json();
                    console.log('[ApiService] Detalhes do erro:', errorData);
                } catch (parseError) {
                    console.error('[ApiService] Erro ao parsear resposta:', parseError);
                }
                throw new Error(errorData.error || TEXTOS.ERRO_LOGIN);
            }
            
            const userData = await response.json();
            console.log('[ApiService] Login bem-sucedido:', { 
                id: userData.id, 
                email: userData.email 
            });
            
            return userData;
        } catch (error) {
            console.error('[ApiService] Erro no login:', {
                message: error.message,
                stack: error.stack
            });
            
            if (error.message.includes('Failed to fetch')) {
                console.warn('[ApiService] Erro de conexão com o servidor');
                throw new Error(TEXTOS.ERRO_CONEXAO);
            }
            throw error;
        } finally {
            console.groupEnd();
        }
    },

    obterVeiculos: async (usuarioId) => {
        console.group(`[ApiService] Buscando veículos para usuário ${usuarioId}`);
        try {
            const inicioRequisicao = Date.now();
            console.log('[ApiService] Enviando requisição para /api/veiculos');
            
            const response = await fetch(`http://localhost:3000/api/veiculos/${usuarioId}`);
            
            const tempoResposta = Date.now() - inicioRequisicao;
            console.log(`[ApiService] Resposta recebida em ${tempoResposta}ms`, response);

            if (!response.ok) {
                console.warn('[ApiService] Erro ao obter veículos:', response.status);
                throw new Error('Erro ao obter veículos');
            }
            
            const veiculos = await response.json();
            console.log(`[ApiService] ${veiculos.length} veículos encontrados`);
            return veiculos;
        } catch (error) {
            console.error('[ApiService] Erro ao buscar veículos:', error);
            throw new Error('Erro ao carregar veículos. Por favor, tente novamente.');
        } finally {
            console.groupEnd();
        }
    },

    processarPagamento: async (pagamentoId, metodo) => {
        console.group(`[ApiService] Processando pagamento ${pagamentoId}`);
        console.log('Método selecionado:', metodo);
        
        try {
            const inicioRequisicao = Date.now();
            console.log('[ApiService] Enviando requisição para /api/pagamentos');
            
            const response = await fetch(`http://localhost:3000/api/pagamentos/${pagamentoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ metodo })
            });

            const tempoResposta = Date.now() - inicioRequisicao;
            console.log(`[ApiService] Resposta recebida em ${tempoResposta}ms`, response);
            
            if (!response.ok) {
                console.warn('[ApiService] Erro no pagamento:', response.status);
                let errorData = {};
                try {
                    errorData = await response.json();
                    console.log('[ApiService] Detalhes do erro:', errorData);
                } catch (parseError) {
                    console.error('[ApiService] Erro ao parsear resposta:', parseError);
                }
                throw new Error(errorData.error || TEXTOS.ERRO_PAGAMENTO);
            }
            
            const resultado = await response.json();
            console.log('[ApiService] Pagamento processado com sucesso:', resultado);
            return resultado;
        } catch (error) {
            console.error('[ApiService] Erro no processamento do pagamento:', error);
            throw new Error(TEXTOS.ERRO_PAGAMENTO);
        } finally {
            console.groupEnd();
        }
    },

    verificarConexao: async () => {
        console.group('[ApiService] Verificando conexão com o servidor');
        try {
            const inicioRequisicao = Date.now();
            console.log('[ApiService] Enviando requisição para /api/health');
            
            const response = await fetch('http://localhost:3000/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const tempoResposta = Date.now() - inicioRequisicao;
            console.log(`[ApiService] Resposta recebida em ${tempoResposta}ms`, response);
            
            return response.ok;
        } catch (error) {
            console.error('[ApiService] Erro na verificação de conexão:', error);
            return false;
        } finally {
            console.groupEnd();
        }
    }
};

// Módulo de Gerenciamento de Estado
const GerenciadorEstado = {
    usuarioAtual: null,
    veiculoSelecionado: null,
    pagamentoSelecionado: null,
    metodoPagamentoSelecionado: null,

    definirUsuarioAtual: function(usuario) {
        console.log('[GerenciadorEstado] Definindo usuário atual:', {
            id: usuario.id,
            email: usuario.email
        });
        this.usuarioAtual = usuario;
        this.atualizarUI();
    },

    definirVeiculoSelecionado: function(veiculo) {
        console.log('[GerenciadorEstado] Definindo veículo selecionado:', {
            id: veiculo.id,
            modelo: veiculo.model
        });
        this.veiculoSelecionado = veiculo;
    },

    definirPagamentoSelecionado: function(pagamento) {
        console.log('[GerenciadorEstado] Definindo pagamento selecionado:', {
            id: pagamento.id,
            descricao: pagamento.description
        });
        this.pagamentoSelecionado = pagamento;
    },

    definirMetodoPagamentoSelecionado: function(metodo) {
        console.log('[GerenciadorEstado] Definindo método de pagamento:', metodo);
        this.metodoPagamentoSelecionado = metodo;
    },

    atualizarUI: function() {
        if (this.usuarioAtual) {
            console.log('[GerenciadorEstado] Atualizando UI com dados do usuário');
            document.getElementById('user-name').textContent = this.usuarioAtual.name;
            document.getElementById('user-avatar').textContent = this.usuarioAtual.avatarInitials;
        }
    },

    resetar: function() {
        console.log('[GerenciadorEstado] Resetando estado');
        this.usuarioAtual = null;
        this.veiculoSelecionado = null;
        this.pagamentoSelecionado = null;
        this.metodoPagamentoSelecionado = null;
    }
};

// Módulo de Interface do Usuário
const UI = {
    inicializar: function() {
        console.log('[UI] Inicializando aplicação');
        this.configurarEventListeners();
        document.getElementById('app-section').style.display = 'none';
    },

    configurarEventListeners: function() {
        console.log('[UI] Configurando event listeners');
        
        // Formulário de login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            console.log('[UI] Evento submit do formulário de login');
            this.tratarLogin(e);
        });
        
        // Botão de logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            console.log('[UI] Evento click no botão de logout');
            this.tratarLogout();
        });
        
        // Botão de voltar
        document.getElementById('back-btn').addEventListener('click', () => {
            console.log('[UI] Evento click no botão de voltar');
            this.mostrarSecaoVeiculos();
        });
        
        // Abas de pagamentos
        document.querySelectorAll('.payment-tab').forEach(aba => {
            aba.addEventListener('click', () => {
                console.log(`[UI] Alternando para aba: ${aba.dataset.tab}`);
                this.alternarAbaPagamentos(aba.dataset.tab);
            });
        });
        
        // Modal de pagamento
        document.getElementById('close-modal').addEventListener('click', () => {
            console.log('[UI] Fechando modal de pagamento');
            this.fecharModalPagamento();
        });
        
        document.getElementById('cancel-payment').addEventListener('click', () => {
            console.log('[UI] Cancelando pagamento');
            this.fecharModalPagamento();
        });
        
        document.getElementById('confirm-payment').addEventListener('click', () => {
            console.log('[UI] Confirmando pagamento');
            this.confirmarPagamento();
        });
        
        // Opções de método de pagamento
        document.querySelectorAll('.payment-method-option').forEach(opcao => {
            opcao.addEventListener('click', () => {
                console.log(`[UI] Método selecionado: ${opcao.dataset.method}`);
                this.selecionarMetodoPagamento(opcao.dataset.method);
            });
        });
        
        // Modal de detalhes
        document.getElementById('close-details-modal').addEventListener('click', () => {
            console.log('[UI] Fechando modal de detalhes');
            this.fecharModalDetalhes();
        });
        
        document.getElementById('close-details-btn').addEventListener('click', () => {
            console.log('[UI] Fechando modal de detalhes');
            this.fecharModalDetalhes();
        });
        
        // Modal genérico
        document.getElementById('close-generic-modal').addEventListener('click', () => {
            console.log('[UI] Fechando modal genérico');
            this.fecharModalGenerico();
        });
        
        document.getElementById('confirm-generic-modal').addEventListener('click', () => {
            console.log('[UI] Confirmando modal genérico');
            this.fecharModalGenerico();
        });

        // Delegação de eventos para os botões dinâmicos
        document.addEventListener('click', (e) => {
            // Botão Pagar
            if (e.target.closest('.pay-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.pay-btn');
                const pagamentoId = parseInt(btn.dataset.id);
                console.log(`[UI] Clicado no botão pagar para ID: ${pagamentoId}`);
                
                const pagamento = this.encontrarPagamentoPorId(pagamentoId);
                if (pagamento) {
                    console.log('[UI] Abrindo modal de pagamento');
                    this.abrirModalPagamento(pagamento);
                } else {
                    console.warn('[UI] Pagamento não encontrado para ID:', pagamentoId);
                }
            }
            
            // Botão Detalhes
            if (e.target.closest('.details-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.details-btn');
                const pagamentoId = parseInt(btn.dataset.id);
                console.log(`[UI] Clicado no botão detalhes para ID: ${pagamentoId}`);
                
                const pagamento = this.encontrarPagamentoPorId(pagamentoId);
                if (pagamento) {
                    console.log('[UI] Abrindo modal de detalhes');
                    this.abrirModalDetalhes(pagamento);
                } else {
                    console.warn('[UI] Pagamento não encontrado para ID:', pagamentoId);
                }
            }
        });
    },

    tratarLogin: async function(e) {
        e.preventDefault();
        console.group('[UI] Tratando login');
        
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('password').value.trim();
        console.log('[UI] Credenciais do formulário:', { email: email?.substring(0, 3) + '...', senha: senha ? '***' : null });
        
        if (!email || !senha) {
            console.warn('[UI] Campos obrigatórios não preenchidos');
            Utils.mostrarModalGenerico('Atenção', TEXTOS.CAMPOS_OBRIGATORIOS);
            console.groupEnd();
            return;
        }

        try {
            console.log('[UI] Chamando ApiService.login');
            const usuario = await ApiService.login(email, senha);
            
            console.log('[UI] Login bem-sucedido, definindo usuário atual');
            GerenciadorEstado.definirUsuarioAtual(usuario);
            
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('app-section').style.display = 'block';
            
            console.log('[UI] Carregando veículos do usuário');
            await this.carregarVeiculos();
        } catch (erro) {
            console.error('[UI] Erro no tratamento do login:', {
                message: erro.message,
                stack: erro.stack
            });
            Utils.mostrarModalGenerico('Erro', erro.message || TEXTOS.ERRO_LOGIN);
        } finally {
            console.groupEnd();
        }
    },

    tratarLogout: function() {
        console.log('[UI] Executando logout');
        GerenciadorEstado.resetar();
        document.getElementById('login-form').reset();
        document.getElementById('app-section').style.display = 'none';
        document.getElementById('auth-section').style.display = 'flex';
    },

    carregarVeiculos: async function() {
        console.group('[UI] Carregando veículos');
        const gridVeiculos = document.getElementById('vehicles-grid');
        gridVeiculos.innerHTML = '';
        
        try {
            console.log('[UI] Obtendo ID do usuário atual:', GerenciadorEstado.usuarioAtual?.id);
            const veiculos = await ApiService.obterVeiculos(GerenciadorEstado.usuarioAtual.id);
            console.log(`[UI] ${veiculos.length} veículos recebidos`);
            
            veiculos.forEach(veiculo => {
                console.log(`[UI] Criando card para veículo ${veiculo.id}`);
                const cardVeiculo = this.criarCardVeiculo(veiculo);
                gridVeiculos.appendChild(cardVeiculo);
            });
        } catch (erro) {
            console.error('[UI] Erro ao carregar veículos:', erro);
            Utils.mostrarModalGenerico('Erro', 'Erro ao carregar veículos. Por favor, tente novamente.');
        } finally {
            console.groupEnd();
        }
    },

    criarCardVeiculo: function(veiculo) {
        console.log(`[UI] Criando card para veículo ${veiculo.id}`);
        const card = document.createElement('div');
        card.className = 'vehicle-card fade-in';
        card.dataset.id = veiculo.id;
        
        const estatisticas = this.calcularEstatisticasPagamentos(veiculo.payments);
        console.log(`[UI] Estatísticas para veículo ${veiculo.id}:`, estatisticas);
        
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
        
        card.addEventListener('click', () => {
            console.log(`[UI] Veículo clicado: ${veiculo.id}`);
            this.mostrarPagamentos(veiculo);
        });
        return card;
    },

    mostrarPagamentos: function(veiculo) {
        console.group(`[UI] Mostrando pagamentos para veículo ${veiculo.id}`);
        GerenciadorEstado.definirVeiculoSelecionado(veiculo);
        
        document.getElementById('payment-vehicle-title').textContent = `Pagamentos - ${veiculo.brand} ${veiculo.model}`;
        document.getElementById('vehicles-section').style.display = 'none';
        document.getElementById('payments-section').style.display = 'block';
        
        console.log(`[UI] Carregando ${veiculo.payments.length} pagamentos`);
        this.carregarPagamentos(veiculo.payments);
        this.alternarAbaPagamentos('all');
        console.groupEnd();
    },

    mostrarSecaoVeiculos: function() {
        console.log('[UI] Voltando para seção de veículos');
        document.getElementById('payments-section').style.display = 'none';
        document.getElementById('vehicles-section').style.display = 'block';
    },

    carregarPagamentos: function(pagamentos) {
        console.group(`[UI] Carregando ${pagamentos.length} pagamentos`);
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
                console.log('[UI] Nenhum pagamento encontrado');
                const mensagemVazia = document.createElement('div');
                mensagemVazia.className = 'text-center mb-3 mt-3';
                mensagemVazia.textContent = TEXTOS.NENHUM_PAGAMENTO;
                lista.appendChild(mensagemVazia);
            }
        });
        
        // Preenche as listas
        pagamentos.forEach(pagamento => {
            console.log(`[UI] Processando pagamento ${pagamento.id}`);
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
        console.groupEnd();
    },

    criarItemPagamento: function(pagamento) {
        console.log(`[UI] Criando item para pagamento ${pagamento.id}`);
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
        if (!GerenciadorEstado.veiculoSelecionado) {
            console.warn('[UI] Nenhum veículo selecionado para buscar pagamento');
            return null;
        }
        
        const pagamento = GerenciadorEstado.veiculoSelecionado.payments.find(p => p.id === pagamentoId);
        if (!pagamento) {
            console.warn(`[UI] Pagamento ${pagamentoId} não encontrado no veículo selecionado`);
        }
        return pagamento;
    },

    alternarAbaPagamentos: function(nomeAba) {
        console.log(`[UI] Alternando para aba: ${nomeAba}`);
        document.querySelectorAll('.payment-tab').forEach(aba => {
            aba.classList.toggle('active', aba.dataset.tab === nomeAba);
        });
        
        ['all', 'pending', 'paid', 'overdue'].forEach(chave => {
            document.getElementById(`${chave}-payments`).classList.toggle('active', chave === nomeAba);
        });
    },

    abrirModalPagamento: function(pagamento) {
        console.group(`[UI] Abrindo modal de pagamento para ${pagamento.id}`);
        if (!pagamento) {
            console.warn('[UI] Pagamento inválido para abrir modal');
            return;
        }
        
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
        
        console.log('[UI] Configurando detalhes do pagamento:', {
            valorOriginal: pagamento.amount,
            multa: pagamento.lateFee,
            desconto: pagamento.discount,
            total: valorTotal
        });
        
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
        console.groupEnd();
    },

    fecharModalPagamento: function() {
        console.log('[UI] Fechando modal de pagamento');
        document.getElementById('payment-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    selecionarMetodoPagamento: function(metodo) {
        console.log(`[UI] Método de pagamento selecionado: ${metodo}`);
        GerenciadorEstado.definirMetodoPagamentoSelecionado(metodo);
        
        document.querySelectorAll('.payment-method-option').forEach(opcao => {
            opcao.classList.toggle('selected', opcao.dataset.method === metodo);
        });
        
        document.getElementById('confirm-payment').disabled = false;
    },

    confirmarPagamento: async function() {
        console.group('[UI] Confirmando pagamento');
        if (!GerenciadorEstado.metodoPagamentoSelecionado) {
            console.warn('[UI] Nenhum método de pagamento selecionado');
            Utils.mostrarModalGenerico('Atenção', TEXTOS.SELECIONE_METODO);
            console.groupEnd();
            return;
        }
        
        try {
            console.log('[UI] Processando pagamento:', {
                pagamentoId: GerenciadorEstado.pagamentoSelecionado.id,
                metodo: GerenciadorEstado.metodoPagamentoSelecionado
            });
            
            const resultado = await ApiService.processarPagamento(
                GerenciadorEstado.pagamentoSelecionado.id, 
                GerenciadorEstado.metodoPagamentoSelecionado
            );
            
            if (resultado.success) {
                console.log('[UI] Pagamento processado com sucesso:', resultado);
                GerenciadorEstado.pagamentoSelecionado.status = STATUS.PAGO;
                GerenciadorEstado.pagamentoSelecionado.paidDate = resultado.dataPagamento;
                GerenciadorEstado.pagamentoSelecionado.paymentMethod = GerenciadorEstado.metodoPagamentoSelecionado;
                
                this.carregarPagamentos(GerenciadorEstado.veiculoSelecionado.payments);
                this.fecharModalPagamento();
                
                Utils.mostrarModalGenerico('Sucesso', TEXTOS.PAGAMENTO_SUCESSO);
            }
        } catch (erro) {
            console.error('[UI] Erro no pagamento:', erro);
            Utils.mostrarModalGenerico('Erro', TEXTOS.ERRO_PAGAMENTO);
        } finally {
            console.groupEnd();
        }
    },

    abrirModalDetalhes: function(pagamento) {
        console.group(`[UI] Abrindo modal de detalhes para pagamento ${pagamento.id}`);
        if (!pagamento) {
            console.warn('[UI] Pagamento inválido para abrir modal');
            return;
        }
        
        GerenciadorEstado.definirPagamentoSelecionado(pagamento);
        
        console.log('[UI] Configurando detalhes do pagamento:', {
            id: pagamento.id,
            status: pagamento.status,
            valor: pagamento.amount
        });
        
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
        console.groupEnd();
    },

    fecharModalDetalhes: function() {
        console.log('[UI] Fechando modal de detalhes');
        document.getElementById('details-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    fecharModalGenerico: function() {
        console.log('[UI] Fechando modal genérico');
        document.getElementById('generic-modal').classList.remove('show');
        document.body.style.overflow = 'auto';
    },

    calcularEstatisticasPagamentos: function(pagamentos) {
        const estatisticas = {
            total: pagamentos.length,
            pagos: pagamentos.filter(p => p.status === STATUS.PAGO).length,
            pendentes: pagamentos.filter(p => p.status === STATUS.PENDENTE).length,
            atrasados: pagamentos.filter(p => p.status === STATUS.ATRASADO).length
        };
        
        console.log('[UI] Estatísticas calculadas:', estatisticas);
        return estatisticas;
    },

    obterClasseIndicadorStatus: function(estatisticas) {
        let classe = '';
        if (estatisticas.atrasados > 0) {
            classe = 'status-danger';
        } else if (estatisticas.pendentes > 0) {
            classe = 'status-warning';
        } else {
            classe = 'status-good';
        }
        
        console.log(`[UI] Classe de status definida: ${classe}`);
        return classe;
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.group('[App] Inicializando aplicação');
    UI.inicializar();
    console.groupEnd();
});