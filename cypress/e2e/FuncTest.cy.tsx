describe('FuncTest.cy.tsx', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Guest', () => {
    it('the page is loaded', () => {
      cy.contains('Login');
      cy.contains('Tambahkan Analisis');
    });

    it('should display the question form', () => {
      cy.contains('Tambahkan Analisis').click();
      cy.get('h1').should('contain', 'Ingin menganalisis masalah apa hari ini?');
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').should('exist');
      cy.get('input[placeholder="Pertanyaan apa yang ingin ditanyakan ..."]').should('exist');
    });

    it('should display error message when submitting without filling title', () => {
      cy.contains('Tambahkan Analisis').click();
      cy.get('button').contains('Kirim').click();
      cy.contains('Judul harus diisi', { timeout: 10000 }).should('be.visible');
    })

    it('should display error message when submitting without filling question', () => {
      cy.contains('Tambahkan Analisis').click();
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').type('Testing');
      cy.get('button').contains('Kirim').click();
      cy.contains('Pertanyaan harus diisi', { timeout: 10000 }).should('be.visible');
    })

    it('should display error message when submitting without creating tags', () => {
      cy.contains('Tambahkan Analisis').click();
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').type('Testing');
      cy.get('input[placeholder="Pertanyaan apa yang ingin ditanyakan ..."]').type('Mengapa Terjadi Penyalahgunaan Narkoba di Kalangan Generasi Muda di Indonesia?');
      cy.get('button').contains('Kirim').click();
      cy.contains('Minimal mengisi 1 kategori', { timeout: 10000 }).should('be.visible');
    })

    it('should display error message when submitting with title length > 40', () => {
      cy.contains('Tambahkan Analisis').click();
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').type('TestingTestingTestingTestingTestingTestingTestingTestingTesting');
      cy.get('input[placeholder="Pertanyaan apa yang ingin ditanyakan ..."]').type('Mengapa Terjadi Penyalahgunaan Narkoba di Kalangan Generasi Muda di Indonesia?');
      cy.get('input[placeholder="Berikan maksimal 3 kategori ..."]').type(`narkoba{enter}`).type(`remaja{enter}`).type(`kenakalan{enter}`);
      cy.get('button').contains('Kirim').click();
      cy.contains('Judul maksimal 40 karakter. Berikan judul yang lebih singkat', { timeout: 10000 }).should('be.visible');
    })

    it('should display error message when submitting with mode pengawasan ' ,() => {
      cy.contains('Tambahkan Analisis').click();

      cy.contains('PRIBADI').click().then(() => {
        cy.contains('PENGAWASAN').should('be.visible').click().then(() => {
          cy.contains('button', 'Simpan').should('be.visible').click();
        });
      })
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').type('Analisis Pengawasan Narkoba');
      cy.get('input[placeholder="Pertanyaan apa yang ingin ditanyakan ..."]').type('Mengapa Terjadi Penyalahgunaan Narkoba di Kalangan Generasi Muda?');
      cy.get('input[placeholder="Berikan maksimal 3 kategori ..."]')
        .type('narkoba{enter}')
        .type('remaja{enter}')
        .type('pengawasan{enter}');

      cy.get('button').contains('Kirim').click();
      cy.contains('Gagal menambahkan analisis. Login terlebih dahulu untuk mode pengawasan', { timeout: 10000 }).should('be.visible');
    })

    it('guest create question and fill in the causes then submit', () => {
      // Step 1: Create a new analysis question
      cy.contains('Tambahkan Analisis').click();
      cy.get('input[placeholder="Ingin menganalisis apa hari ini ..."]').type('Testing');
      cy.get('input[placeholder="Pertanyaan apa yang ingin ditanyakan ..."]').type('Mengapa Terjadi Penyalahgunaan Narkoba di Kalangan Generasi Muda di Indonesia?');
      cy.get('input[placeholder="Berikan maksimal 3 kategori ..."]').type(`narkoba{enter}`).type(`remaja{enter}`).type(`kenakalan{enter}`);
      cy.get('button').contains('Kirim').click();
      
      // Step 2: Wait for success message and redirection to complete
      cy.contains('Analisis berhasil ditambahkan', { timeout: 10000 }).should('be.visible');
      
      // Step 3: Wait for the validator page to load and the rows to be visible
      cy.contains('Sebab:', { timeout: 10000 }).should('be.visible');
      
      // Step 4: Fill in the causes for the first row (columns A, B, C)
      cy.get('[data-testid="row-container"] textarea').eq(0).type('Kurangnya pengawasan dari orang tua.');
      cy.get('[data-testid="row-container"] textarea').eq(1).type('Kurangnya pemahaman mengenai bahaya penyalahgunaan narkoba.');
      cy.get('[data-testid="row-container"] textarea').eq(2).type('Pergaulan bebas tanpa pengawasan orang tua.');
      
      // Step 5: Submit the causes
      cy.get('button').contains('Kirim Sebab').click();
      
      // Step 6: Wait for the analysis to complete
      cy.contains('Melakukan Analisis, Mohon Tunggu...', { timeout: 20000 }).should('exist');
      cy.contains('Sebab selesai divalidasi', { timeout: 20000 }).should('exist');
    });
  });
});
  
  