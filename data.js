  // Dados de exemplo
  const sampleData = {
    user: {
      id: 1,
      name: "João Silva",
      email: "joao.silva@exemplo.com",
      avatarInitials: "JS"
    },
    vehicles: [
      {
        id: 1,
        model: "Toyota Corolla",
        brand: "Toyota",
        year: 2022,
        plate: "ABC-1234",
        image: "https://source.unsplash.com/random/600x400/?toyota-corolla",
        rentalStart: "01/01/2023",
        rentalEnd: "31/12/2023",
        status: "active",
        payments: [
          { 
            id: 101, 
            dueDate: "05/01/2023", 
            amount: 2500.00, 
            status: "paid", 
            paidDate: "03/01/2023",
            description: "Pagamento mensal - Janeiro",
            paymentMethod: "credit",
            invoiceNumber: "INV-2023-001",
            lateFee: 0,
            discount: 0
          },
          { 
            id: 102, 
            dueDate: "05/02/2023", 
            amount: 2500.00, 
            status: "paid", 
            paidDate: "02/02/2023",
            description: "Pagamento mensal - Fevereiro",
            paymentMethod: "pix",
            invoiceNumber: "INV-2023-002",
            lateFee: 0,
            discount: 100.00
          },
          { 
            id: 103, 
            dueDate: "05/03/2023", 
            amount: 2500.00, 
            status: "paid", 
            paidDate: "01/03/2023",
            description: "Pagamento mensal - Março",
            paymentMethod: "debit",
            invoiceNumber: "INV-2023-003",
            lateFee: 0,
            discount: 0
          },
          { 
            id: 104, 
            dueDate: "05/04/2023", 
            amount: 2500.00, 
            status: "overdue", 
            description: "Pagamento mensal - Abril",
            invoiceNumber: "INV-2023-004",
            lateFee: 150.00,
            discount: 0
          },
          { 
            id: 105, 
            dueDate: "05/05/2023", 
            amount: 2500.00, 
            status: "pending", 
            description: "Pagamento mensal - Maio",
            invoiceNumber: "INV-2023-005",
            lateFee: 0,
            discount: 0
          },
          { 
            id: 106, 
            dueDate: "05/06/2023", 
            amount: 2500.00, 
            status: "pending", 
            description: "Pagamento mensal - Junho",
            invoiceNumber: "INV-2023-006",
            lateFee: 0,
            discount: 0
          }
        ]
      },
      {
        id: 2,
        model: "Honda Civic",
        brand: "Honda",
        year: 2021,
        plate: "XYZ-9876",
        image: "https://source.unsplash.com/random/600x400/?honda-civic",
        rentalStart: "15/02/2023",
        rentalEnd: "14/02/2024",
        status: "active",
        payments: [
          { 
            id: 201, 
            dueDate: "20/02/2023", 
            amount: 2200.00, 
            status: "paid", 
            paidDate: "18/02/2023",
            description: "Pagamento mensal - Fevereiro",
            paymentMethod: "credit",
            invoiceNumber: "INV-2023-007",
            lateFee: 0,
            discount: 0
          },
          { 
            id: 202, 
            dueDate: "20/03/2023", 
            amount: 2200.00, 
            status: "paid", 
            paidDate: "19/03/2023",
            description: "Pagamento mensal - Março",
            paymentMethod: "boleto",
            invoiceNumber: "INV-2023-008",
            lateFee: 0,
            discount: 0
          },
          { 
            id: 203, 
            dueDate: "20/04/2023", 
            amount: 2200.00, 
            status: "overdue", 
            description: "Pagamento mensal - Abril",
            invoiceNumber: "INV-2023-009",
            lateFee: 120.00,
            discount: 0
          },
          { 
            id: 204, 
            dueDate: "20/05/2023", 
            amount: 2200.00, 
            status: "pending", 
            description: "Pagamento mensal - Maio",
            invoiceNumber: "INV-2023-010",
            lateFee: 0,
            discount: 0
          }
        ]
      }
    ]
  };