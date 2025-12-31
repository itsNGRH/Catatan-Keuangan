const halaman = {
    beranda: document.getElementById('beranda'),
    transaksi: document.getElementById('transaksi'),
    laporan: document.getElementById('laporan'),
    profil: document.getElementById('profil')
};

function tutupSemua() {
    Object.values(halaman).forEach(div => {
        div.style.display = 'none';
    });
}

function bukaBeranda() {
    tutupSemua();
    halaman.beranda.style.display = 'block';
}

function bukaTransaksi() {
    tutupSemua();
    halaman.transaksi.style.display = 'block';
    document.getElementById('tanggal').value = getTanggalHariIni();
    renderTransaksiTerakhir();
}

function bukaLaporan() {
    tutupSemua();
    renderLaporan();
    halaman.laporan.style.display = 'block';
}

function bukaProfil() {
    tutupSemua();
    halaman.profil.style.display = 'block';
}

document.getElementById('btnBeranda')
    .addEventListener('click', bukaBeranda);

document.getElementById('btnTransaksi')
    .addEventListener('click', bukaTransaksi);

document.getElementById('btnLaporan')
    .addEventListener('click', bukaLaporan);

document.getElementById('btnProfil')
    .addEventListener('click', bukaProfil);

let daftarTransaksi = []

function simpanTransaksi() {
    const jenis = document.getElementById('jenis').value;
    const tanggalInput = document.getElementById('tanggal').value;
    const tanggal = tanggalInput || getTanggalHariIni();

    const keterangan = document
        .getElementById('keterangan')
        .value
        .trim();

    const nominal = Number(
        document.getElementById('nominal').value
    );

    if (!jenis || !keterangan || nominal <= 0) {
        alert('Data transaksi tidak valid');
        return;
    }

    const transaksi = {
        id: Date.now(),
        jenis,
        tanggal,
        keterangan,
        nominal
    };

    daftarTransaksi.push(transaksi);

    document.getElementById('formulirTransaksi').reset();

    document.getElementById('tanggal').value =
        getTanggalHariIni();

    hitungRingkasan();
    renderLaporan();
    simpanKeStorage();
}

document
    .getElementById('formulirTransaksi')
    .addEventListener('submit', function (e) {
        e.preventDefault();
        simpanTransaksi();
    });

function hitungRingkasan() {
    let totalPemasukan = 0;
    let totalPengeluaran = 0;

    daftarTransaksi.forEach(transaksi => {
        if (transaksi.jenis === 'pemasukan') {
            totalPemasukan += transaksi.nominal;
        } else if (transaksi.jenis === 'pengeluaran') {
            totalPengeluaran += transaksi.nominal;
        }
    });

    hitungRingkasanBulanIni();
    hitungRingkasanTahunIni();
    renderTransaksiTerakhir();
}

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

function filterTransaksiByBulan(tahun, bulan) {
    return daftarTransaksi.filter(t => {
        const d = new Date(t.tanggal);
        return (
            d.getFullYear() === tahun &&
            d.getMonth() === bulan
        );
    });
}

function filterTransaksiByTahun(tahun) {
    return daftarTransaksi.filter(t => {
        const d = new Date(t.tanggal);
        return d.getFullYear() === tahun;
    });
}

function hitungTotal(transaksi) {
    let pemasukan = 0;
    let pengeluaran = 0;

    transaksi.forEach(t => {
        if (t.jenis === 'pemasukan') pemasukan += t.nominal;
        if (t.jenis === 'pengeluaran') pengeluaran += t.nominal;
    });

    return {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran
    };
}

function getTanggalHariIni() {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

function setDefaultBulanLaporan() {
    const bulanInput = document.getElementById('bulan');
    const now = new Date();

    const value =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0');

    bulanInput.value = value;
}

function getNamaBulanIndonesia(indexBulan) {
    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    return namaBulan[indexBulan];
}

function hitungRingkasanBulanIni() {
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = now.getMonth();

    const transaksiBulanIni =
        filterTransaksiByBulan(tahun, bulan);

    const { pemasukan, pengeluaran, saldo } =
        hitungTotal(transaksiBulanIni);

    document.getElementById('pemasukanBulanIni').textContent =
        formatRupiah(pemasukan);

    document.getElementById('pengeluaranBulanIni').textContent =
        formatRupiah(pengeluaran);

    document.getElementById('saldoBulanIni').textContent =
        formatRupiah(saldo);

    document.getElementById('bulanIni').textContent =
        `Bulan ${getNamaBulanIndonesia(bulan)}`;
}

function hitungRingkasanTahunIni() {
    const tahun = new Date().getFullYear();
    const transaksiTahunIni = filterTransaksiByTahun(tahun);

    const { pemasukan, pengeluaran, saldo } =
        hitungTotal(transaksiTahunIni);

    document.getElementById('pemasukanTahunIni').textContent =
        formatRupiah(pemasukan);

    document.getElementById('pengeluaranTahunIni').textContent =
        formatRupiah(pengeluaran);

    document.getElementById('saldoTahunIni').textContent =
        formatRupiah(saldo);

    document.getElementById('tahunIni').textContent =
        `Tahun ${tahun}`;
}

function getDataGrafikBulanan(bulanAwal, bulanAkhir) {
    const hasil = {};

    daftarTransaksi.forEach(t => {
        const d = new Date(t.tanggal);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        if (key < bulanAwal || key > bulanAkhir) return;

        if (!hasil[key]) {
            hasil[key] = { pemasukan: 0, pengeluaran: 0 };
        }

        hasil[key][t.jenis] += t.nominal;
    });

    return hasil;
}

function getDataGrafikTahunan(tahunAwal, tahunAkhir) {
    const hasil = {};

    daftarTransaksi.forEach(t => {
        const d = new Date(t.tanggal);
        const tahun = d.getFullYear();

        if (tahun < tahunAwal || tahun > tahunAkhir) return;

        if (!hasil[tahun]) {
            hasil[tahun] = { pemasukan: 0, pengeluaran: 0 };
        }

        hasil[tahun][t.jenis] += t.nominal;
    });

    return hasil;
}

function renderLaporan() {
    const tbody = document.getElementById('tabelLaporan');
    const filterBulan = document.getElementById('bulan').value;

    tbody.innerHTML = '';

    let transaksiTampil = filterBulan
        ? daftarTransaksi.filter(transaksi =>
            transaksi.tanggal.startsWith(filterBulan)
          )
        : [...daftarTransaksi];

    // ================= SORTING =================
    transaksiTampil.sort((a, b) => {
        if (a.tanggal < b.tanggal) return -1;
        if (a.tanggal > b.tanggal) return 1;

        return a.id - b.id;
    });

    if (transaksiTampil.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 6;
        cell.textContent = 'Tidak ada data transaksi';
        cell.style.textAlign = 'center';

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    transaksiTampil.forEach((transaksi, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatJenis(transaksi.jenis)}</td>
            <td>${transaksi.tanggal}</td>
            <td>${transaksi.keterangan}</td>
            <td>${formatRupiah(transaksi.nominal)}</td>
            <td>
                <button onclick="hapusTransaksi(${transaksi.id})">
                    Hapus
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

document
    .getElementById('bulan')
    .addEventListener('change', renderLaporan);

function hapusTransaksi(id) {
    const konfirmasi = confirm('Yakin ingin menghapus transaksi ini?');

    if (!konfirmasi) return;

    daftarTransaksi = daftarTransaksi.filter(
        transaksi => transaksi.id !== id
    );

    simpanKeStorage();
    hitungRingkasan();
    renderLaporan();
    renderTransaksiTerakhir();
}

const STORAGE_KEY = 'laporan_keuangan_masjid';

function simpanKeStorage() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(daftarTransaksi)
    );
}

function ambilDariStorage() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
        daftarTransaksi = [];
        return;
    }

    try {
        daftarTransaksi = JSON.parse(data);
    } catch (error) {
        console.error('Data storage rusak:', error);
        daftarTransaksi = [];
    }
}

const PROFIL_KEY = 'profil_masjid';

let profilMasjid = {
    namaMasjid: ''
};

function simpanProfil() {
    const namaMasjid = document
        .getElementById('namaMasjid')
        .value
        .trim();

    if (!namaMasjid) {
        alert('Nama masjid tidak boleh kosong');
        return;
    }

    profilMasjid.namaMasjid = namaMasjid;

    localStorage.setItem(
        PROFIL_KEY,
        JSON.stringify(profilMasjid)
    );

    renderHeader();
}

function ambilProfil() {
    const data = localStorage.getItem(PROFIL_KEY);

    if (!data) return;

    try {
        profilMasjid = JSON.parse(data);
    } catch {
        profilMasjid = { namaMasjid: '' };
    }
}

function renderHeader() {
    const judulMasjid = document.getElementById('judulMasjid');

    judulMasjid.textContent = profilMasjid.namaMasjid
        ? profilMasjid.namaMasjid
        : '';
}

document
    .getElementById('namaMasjid')
    .addEventListener('change', simpanProfil);

document.getElementById('namaMasjid').value =
    profilMasjid.namaMasjid || '';

function downloadCSV() {
    if (daftarTransaksi.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    const periodeTipe = document.getElementById('csvPeriodeTipe').value;
    const bulanInput = document.getElementById('csvBulan').value;
    const tahunInput = Number(document.getElementById('csvTahun').value);

    let transaksiFilter = [...daftarTransaksi];

    if (periodeTipe === 'bulan' && bulanInput) {
        transaksiFilter = transaksiFilter.filter(t => t.tanggal.startsWith(bulanInput));
    } else if (periodeTipe === 'tahun' && tahunInput) {
        transaksiFilter = transaksiFilter.filter(t => new Date(t.tanggal).getFullYear() === tahunInput);
    }

    if (transaksiFilter.length === 0) {
        alert('Tidak ada data sesuai periode yang dipilih');
        return;
    }

    const header = ['tanggal', 'jenis', 'keterangan', 'nominal'];
    const rows = transaksiFilter.map(t => [
        t.tanggal,
        t.jenis,
        `"${t.keterangan.replace(/"/g, '""')}"`,
        t.nominal
    ]);

    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;

    const namaMasjidFile = slugifyNamaMasjid(profilMasjid.namaMasjid);

    let periodeFile = 'Lengkap';

    if (periodeTipe === 'bulan' && bulanInput) {
        periodeFile = getNamaBulanIndonesiaDariValue(bulanInput);
    } else if (periodeTipe === 'tahun' && tahunInput) {
        periodeFile = tahunInput;
    }

    a.download =
        `Pencadangan-Laporan-Keuangan-${namaMasjidFile}-${periodeFile}.csv`;

    a.click();
    URL.revokeObjectURL(url);
}

(function initCsvPeriode() {
    const selectPeriode = document.getElementById('csvPeriodeTipe');
    const inputBulan = document.getElementById('csvBulan');
    const inputTahun = document.getElementById('csvTahun');

    const now = new Date();

    inputBulan.value = now.toISOString().slice(0, 7);
    inputTahun.value = now.getFullYear();

    function updateInputPeriode() {
        if (selectPeriode.value === 'bulan') {
            inputBulan.hidden = false;
            inputTahun.hidden = true;
        } else if (selectPeriode.value === 'tahun') {
            inputBulan.hidden = true;
            inputTahun.hidden = false;
        } else {
            inputBulan.hidden = true;
            inputTahun.hidden = true;
        }
    }

    selectPeriode.addEventListener('change', updateInputPeriode);

    updateInputPeriode();
})();

function downloadTemplateCSV() {
    const template = [
        'tanggal,jenis,keterangan,nominal',
        '2025-01-01,pemasukan,Contoh pemasukan,100000'
    ].join('\n');

    const blob = new Blob(
        [template],
        { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'format-laporan-keuangan.csv';
    a.click();

    URL.revokeObjectURL(url);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let char of line) {
        if (char === '"' ) {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result.map(v => v.replace(/^"|"$/g, ''));
}

document
    .getElementById('btnDownloadCsv')
    .addEventListener('click', downloadCSV);

document
    .getElementById('btnDownloadTemplateCsv')
    .addEventListener('click', downloadTemplateCSV);

const STORAGE_LOGO_KEY = 'logoMasjid';

const uploadLogoInput = document.getElementById('uploadLogo');
const btnUploadLogo = document.getElementById('btnUploadLogo');
const logoImg = document.getElementById('logoMasjid');
const namaFileLogo = document.getElementById('namaFileLogo');

btnUploadLogo.addEventListener('click', () => {
    uploadLogoInput.click();
});

uploadLogoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const base64 = e.target.result;

        localStorage.setItem(STORAGE_LOGO_KEY, base64);

        logoImg.src = base64;
        logoImg.style.display = 'block';
        namaFileLogo.textContent = file.name;
        setFaviconFromLogo(savedLogo);
    };

    reader.readAsDataURL(file);
});

function loadLogoMasjid() {
    const savedLogo = localStorage.getItem(STORAGE_LOGO_KEY);

    if (savedLogo) {
        logoImg.src = savedLogo;
        logoImg.style.display = 'block';
        setFaviconFromLogo(savedLogo);
    } else {
        logoImg.style.display = 'none';
    }
}

function uploadCSV(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
        try {
            const text = event.target.result.trim();
            const lines = text.split('\n');

            if (lines.length < 2) {
                throw new Error('File CSV tidak berisi data');
            }

            const header = lines[0].trim();
            const expectedHeader = 'tanggal,jenis,keterangan,nominal';

            if (header !== expectedHeader) {
                throw new Error(
                    'Header CSV tidak sesuai.\nHarus: ' + expectedHeader
                );
            }

            const transaksiBaru = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const values = parseCSVLine(lines[i]);

                if (values.length !== 4) {
                    throw new Error(`Format baris ${i + 1} tidak valid`);
                }

                const [tanggal, jenis, keterangan, nominal] = values;

                if (
                    !tanggal ||
                    !['pemasukan', 'pengeluaran'].includes(jenis) ||
                    !keterangan ||
                    isNaN(Number(nominal))
                ) {
                    throw new Error(`Data tidak valid di baris ${i + 1}`);
                }

                transaksiBaru.push({
                    id: Date.now() + Math.random(),
                    tanggal,
                    jenis,
                    keterangan,
                    nominal: Number(nominal)
                });
            }

            if (transaksiBaru.length === 0) {
                throw new Error('Tidak ada data valid untuk diimpor');
            }

            daftarTransaksi = daftarTransaksi.concat(transaksiBaru);

            simpanKeStorage();
            hitungRingkasan();
            renderLaporan();

            alert(`${transaksiBaru.length} transaksi berhasil ditambahkan`);
        } catch (error) {
            alert('Gagal upload CSV: ' + error.message);
        }
    };

    reader.readAsText(file);
}

document
    .getElementById('uploadCsv')
    .addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) uploadCSV(file);
        e.target.value = '';
    });

const uploadCsvInput = document.getElementById('uploadCsv');
const btnUploadCsv = document.getElementById('btnUploadCsv');
const namaFileCsv = document.getElementById('namaFileCsv');

btnUploadCsv.addEventListener('click', () => {
    uploadCsvInput.click();
});

function hapusSemuaData() {
    const konfirmasi = confirm(
        'SEMUA data akan dihapus permanen.\n\n' +
        '• Transaksi\n' +
        '• Nama masjid\n' +
        '• Logo masjid\n\n' +
        'Lanjutkan?'
    );

    if (!konfirmasi) return;

    daftarTransaksi = [];

    localStorage.removeItem(PROFIL_KEY);
    localStorage.removeItem(STORAGE_LOGO_KEY);
    localStorage.removeItem(STORAGE_KEY);

    hitungRingkasan();
    renderLaporan();
    loadLogoMasjid();
    resetFavicon();

    document.getElementById('namaMasjid').value = '';
    document.getElementById('judulMasjid').textContent = '';

    const logoImg = document.getElementById('logoMasjid');
    logoImg.src = '';
    logoImg.style.display = 'none';

    alert('Semua data berhasil dihapus. Aplikasi kembali ke kondisi awal.');
    setTimeout(() => {
       location.reload(); 
    }, 100);
}

document
    .getElementById('btnHapusData')
    .addEventListener('click', hapusSemuaData);

let chartKeuangan = null;

function renderGrafik(labels, dataPemasukan, dataPengeluaran) {
    const ctx = document
        .getElementById('chartKeuangan')
        .getContext('2d');

    if (chartKeuangan) {
        chartKeuangan.destroy();
    }

    chartKeuangan = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: dataPemasukan,
                },
                {
                    label: 'Pengeluaran',
                    data: dataPengeluaran,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: value => formatRupiah(value)
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: ctx =>
                            ctx.dataset.label + ': ' +
                            formatRupiah(ctx.raw)
                    }
                }
            }
        }
    });
}

function updateGrafikBulanan() {
    const bulanAwal = document.getElementById('bulanAwal').value;
    const bulanAkhir = document.getElementById('bulanAkhir').value;

    if (!bulanAwal || !bulanAkhir) return;

    const data = getDataGrafikBulanan(bulanAwal, bulanAkhir);

    const labels = buatLabelGrafikBulanan(data);

    const keys = Object.keys(data).sort();
    const pemasukan = keys.map(k => data[k].pemasukan);
    const pengeluaran = keys.map(k => data[k].pengeluaran);

    renderGrafik(labels, pemasukan, pengeluaran);
}

function updateGrafikTahunan() {
    const tahunAwal = Number(
        document.getElementById('tahunAwal').value
    );
    const tahunAkhir = Number(
        document.getElementById('tahunAkhir').value
    );

    if (!tahunAwal || !tahunAkhir) return;

    const data = getDataGrafikTahunan(tahunAwal, tahunAkhir);

    const labels = Object.keys(data).sort();
    const pemasukan = labels.map(l => data[l].pemasukan);
    const pengeluaran = labels.map(l => data[l].pengeluaran);

    renderGrafik(labels, pemasukan, pengeluaran);
}

const tipePeriode = document.getElementById('tipePeriode');
const rangeBulan = document.getElementById('rangeBulan');
const rangeTahun = document.getElementById('rangeTahun');

tipePeriode.addEventListener('change', function () {
    if (this.value === 'bulan') {
        rangeBulan.hidden = false;
        rangeTahun.hidden = true;
        updateGrafikBulanan();
    } else {
        rangeBulan.hidden = true;
        rangeTahun.hidden = false;
        updateGrafikTahunan();
    }
});

document
    .getElementById('bulanAwal')
    .addEventListener('change', updateGrafikBulanan);

document
    .getElementById('bulanAkhir')
    .addEventListener('change', updateGrafikBulanan);

document
    .getElementById('tahunAwal')
    .addEventListener('change', updateGrafikTahunan);

document
    .getElementById('tahunAkhir')
    .addEventListener('change', updateGrafikTahunan);

function renderTransaksiTerakhir() {
    const tbody = document.getElementById('tabelTransaksiTerakhir');
    if (!tbody) return;

    tbody.innerHTML = '';

    const transaksiTerbaru = [...daftarTransaksi]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    if (transaksiTerbaru.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');

        cell.colSpan = 6;
        cell.textContent = 'Belum ada transaksi';
        cell.style.textAlign = 'center';

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    transaksiTerbaru.forEach((t, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formatJenis(t.jenis)}</td>
            <td>${t.tanggal}</td>
            <td>${t.keterangan}</td>
            <td>${formatRupiah(t.nominal)}</td>
            <td>
                <button onclick="hapusTransaksi(${t.id})">
                    Hapus
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function unduhLaporanPDF() {
    
    const bulan = document.getElementById('bulan').value;

    if (!bulan) {
        alert('Pilih bulan laporan terlebih dahulu');
        return;
    }

    const transaksiBulan = daftarTransaksi.filter(t =>
        t.tanggal.startsWith(bulan)
    );

    if (transaksiBulan.length === 0) {
        alert('Tidak ada data pada bulan ini');
        return;
    }

    const { pemasukan, pengeluaran, saldo } = hitungTotalTransaksi(transaksiBulan);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ================= HEADER =================
    const periodeText = formatPeriodeIndonesia(bulan);
    let startY = 20;

    const logo = localStorage.getItem(STORAGE_LOGO_KEY);
    if (logo) {
        doc.addImage(logo, 'PNG', 15, 10, 20, 20);
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN KEUANGAN', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
        profilMasjid.namaMasjid || '',
        105,
        22,
        { align: 'center' }
    );

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
        `Periode: ${periodeText}`,
        105,
        28,
        { align: 'center' }
    );

    startY = 35;

    // ================= TABEL TRANSAKSI =================
    const rows = transaksiBulan.map((t, i) => [
        i + 1,
        formatJenis(t.jenis),
        t.tanggal,
        t.keterangan,
        formatRupiah(t.nominal)
    ]);

    doc.autoTable({
        startY,
        head: [['No', 'Jenis', 'Tanggal', 'Keterangan', 'Nominal']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            4: { halign: 'right' }
        }
    });

    // ================= TABEL RINGKASAN =================
    const summaryStartY = doc.lastAutoTable.finalY + 10;

    doc.autoTable({
        startY: summaryStartY,
        head: [['Ringkasan', 'Jumlah']],
        body: [
            ['Total Pemasukan', formatRupiah(pemasukan)],
            ['Total Pengeluaran', formatRupiah(pengeluaran)],
            ['Saldo', formatRupiah(saldo)]
        ],
        styles: {
            fontSize: 10
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0
        },
        columnStyles: {
            1: { halign: 'right' }
        },
        didParseCell: function (data) {
            if (data.section === 'head' && data.column.index === 1) {
                data.cell.styles.halign = 'right';
            }

            if (
                data.section === 'body' &&
                data.row.index === 2
            ) {
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // ================= SIMPAN =================
    
    const namaMasjidFile = slugifyNamaMasjid(profilMasjid.namaMasjid);
const periodeFile = getNamaBulanIndonesiaDariValue(bulan);

doc.save(
    `Laporan-Keuangan-${namaMasjidFile}-${periodeFile}.pdf`
);

}

function formatPeriodeIndonesia(bulanValue, tampilkanTahun = true) {
    const [tahun, bulan] = bulanValue.split('-').map(Number);

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];

    return tampilkanTahun ? `${namaBulan[bulan - 1]} ${tahun}` : namaBulan[bulan - 1];
}

function buatLabelGrafikBulanan(data) {
    const keys = Object.keys(data).sort();
    const tahunUnique = [...new Set(keys.map(k => k.split('-')[0]))];

    const tampilkanTahun = tahunUnique.length > 1;

    return keys.map(k => formatPeriodeIndonesia(k, tampilkanTahun));
}

function hitungTotalTransaksi(transaksi) {
    let pemasukan = 0;
    let pengeluaran = 0;

    transaksi.forEach(t => {
        if (t.jenis === 'pemasukan') {
            pemasukan += t.nominal;
        } else if (t.jenis === 'pengeluaran') {
            pengeluaran += t.nominal;
        }
    });

    return {
        pemasukan,
        pengeluaran,
        saldo: pemasukan - pengeluaran
    };
}

function formatJenis(jenis) {
    if (!jenis) return '';
    return jenis.charAt(0).toUpperCase() + jenis.slice(1);
}

function slugifyNamaMasjid(nama) {
    return (nama || 'Masjid')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '');
}

function getNamaBulanIndonesiaDariValue(bulanValue) {
    const [tahun, bulan] = bulanValue.split('-').map(Number);
    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April',
        'Mei', 'Juni', 'Juli', 'Agustus',
        'September', 'Oktober', 'November', 'Desember'
    ];
    return `${namaBulan[bulan - 1]}-${tahun}`;
}

function setFaviconFromLogo(base64) {
    let favicon = document.getElementById('favicon');

    if (!favicon) {
        favicon = document.createElement('link');
        favicon.id = 'favicon';
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        document.head.appendChild(favicon);
    }

    favicon.href = base64;
}

function resetFavicon() {
    const favicon = document.getElementById('favicon');
    if (favicon) {
        favicon.href = '';
    }
}

loadLogoMasjid();
ambilDariStorage();
ambilProfil();
renderHeader();
hitungRingkasan();
setDefaultBulanLaporan();
renderLaporan();
bukaBeranda();

(function setDefaultGrafik() {
    const now = new Date();
    const bulan = now.toISOString().slice(0, 7);
    const tahun = now.getFullYear();

    document.getElementById('bulanAwal').value = bulan;
    document.getElementById('bulanAkhir').value = bulan;

    document.getElementById('tahunAwal').value = tahun;
    document.getElementById('tahunAkhir').value = tahun;

    updateGrafikBulanan();
})();
