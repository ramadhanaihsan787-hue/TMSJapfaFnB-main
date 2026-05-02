// src/features/finance/constants.ts

export const FLEET_DATA = [
    { plate: 'B 9514 JXS', type: 'CDD', driver: 'Budi Santoso' },
    { plate: 'B 9513 JXS', type: 'CDEL', driver: 'Ahmad Yani' },
    { plate: 'B 9044 JXS', type: 'CDEL', driver: 'Slamet Riyadi' },
    { plate: 'B 9517 JXS', type: 'CDE', driver: 'Dwi Cahyo' },
    { plate: 'B 9518 JXS', type: 'CDE', driver: 'Heri Prasetyo' },
    { plate: 'B 9522 JXS', type: 'CDE', driver: 'Joko Widodo' },
    { plate: 'B 9487 JXS', type: 'CDE', driver: 'Agus Salim' },
];

export const DRIVER_NAMES = [
    'Oman Surahman', 'Wanto Alfrian', 'Suwondo', 'Martono', 'Witanto Setiawan',
    'Muhammad Maulana Hakiki', 'Yoga Dwi Aditya', 'Joko Wiyono', 'Eko Prasetyo',
    'Lestari Primadani', 'Nanang Prianto', 'Ari Zasmara', 'Santoso', 'Fauzan',
];

export const HELPER_NAMES = [...DRIVER_NAMES];

export const formatRp = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);