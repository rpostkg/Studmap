export interface Room {
    id: string;
    name: string;
    nickname?: string;
    type: 'room' | 'auditorium' | 'lab' | 'office' | 'meeting' | 'staircase' | 'corridor' | 'spacer';
    x: number;
    y: number;
    width: number;
    height: number;
    hasPanorama?: boolean;
    panoramaUrl?: string;
    hasTag?: boolean;
}

export interface Floor {
    level: number;
    rooms: Room[];
}

export const buildingData: Floor[] = [
    {
        level: 1,
        rooms: [
            { id: 'c3', name: 'Corridor', type: 'corridor', width: 1, height: 20, x: 0, y: 0 },
            { id: 'floor2_staircase1', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 5 },
            { id: 'floor2_staircase2', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 14 },
            // Right side
            { id: '301', name: '301', type: 'room', width: 2, height: 3, x: 1, y: 0 },
            { id: '303', name: '303', type: 'room', width: 2, height: 2, x: 1, y: 3 },
            { id: '305', name: '305', type: 'room', width: 2, height: 2.5, x: 1, y: 6 },
            { id: '307', name: '307', type: 'room', width: 2, height: 2.5, x: 1, y: 8.5 },
            { id: '309', name: '309', type: 'room', width: 2, height: 3, x: 1, y: 11 },
            { id: 'watercloset', name: 'WC', type: 'room', width: 2, height: 1.25, x: 1, y: 15 },
            { id: 'watercloset', name: 'WC', type: 'room', width: 2, height: 1.25, x: 1, y: 16.25 },
            { id: 'kitchen', name: 'Kitchen', type: 'room', width: 2, height: 1.15, x: 1, y: 17.5 },
            { id: 'cafeteria1', name: 'Cafeteria', type: 'room', width: 2, height: 1.35, x: 1, y: 18.65 },
            //Left side
            { id: '300', name: '300', type: 'room', width: 2, height: 3, x: -2, y: 0 },
            { id: '302', name: '302', type: 'room', width: 2, height: 3, x: -2, y: 3 },
            { id: '304', name: '304', type: 'room', width: 2, height: 3, x: -2, y: 6 },
            { id: 'entrance', name: 'Entrance', type: 'staircase', width: 2, height: 4, x: -2, y: 9 },
            { id: '308', name: '308', type: 'room', width: 2, height: 2.5, x: -2, y: 13 },
            { id: '310', name: '310', type: 'room', width: 2, height: 1, x: -2, y: 15.5 },
            { id: 'hall', name: 'General Hall', type: 'room', width: 2, height: 2, x: -2, y: 16.5 },
            { id: 'cafeteria2', name: 'Cafeteria', type: 'room', width: 2, height: 1.5, x: -2, y: 18.5 },
        ]
    },
    {
        level: 2,
        rooms: [
            { id: 'c3', name: 'Corridor', type: 'corridor', width: 1, height: 20, x: 0, y: 0 },
            { id: 'floor2_staircase1', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 5 },
            { id: 'floor2_staircase2', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 14 },
            // Right side
            { id: '319', name: '319', type: 'room', width: 2, height: 3, x: 1, y: 0 },
            { id: '321', name: '321', type: 'room', width: 2, height: 2, x: 1, y: 3 },
            { id: '323', name: '323', type: 'room', width: 2, height: 2, x: 1, y: 6 },
            { id: '325', name: '325', type: 'room', width: 2, height: 3, x: 1, y: 8 },
            { id: '327', name: '327', type: 'room', width: 2, height: 3, x: 1, y: 11 },
            { id: '329', name: '329', type: 'room', width: 2, height: 2, x: 1, y: 15, hasTag: true },
            { id: '331', name: '331', type: 'room', width: 2, height: 3, x: 1, y: 17 },
            //Left side
            { id: '312', name: '312', type: 'room', width: 2, height: 3, x: -2, y: 0, hasTag: true, hasPanorama: true, panoramaUrl: '/panoramas/312/pano.jpg' },
            { id: '314', name: '314', type: 'room', width: 2, height: 2.5, x: -2, y: 3 },
            { id: '316', name: '316', type: 'room', width: 2, height: 3, x: -2, y: 5.5 },
            { id: '318', name: '318', type: 'room', width: 2, height: 2.5, x: -2, y: 8.5 },
            { id: '320', name: '320', type: 'room', width: 2, height: 3, x: -2, y: 11 },
            { id: '322', name: '322', type: 'room', width: 2, height: 3, x: -2, y: 14 },
            { id: '324', name: '324', type: 'room', width: 2, height: 3, x: -2, y: 17, hasTag: true },
        ]
    },
    {
        level: 3,
        rooms: [
            { id: 'c3', name: 'Corridor', type: 'corridor', width: 1, height: 20, x: 0, y: 0 },
            { id: 'floor3_staircase1', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 5 },
            { id: 'floor3_staircase2', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 14 },
            // Right side
            { id: '333', name: '333', type: 'room', width: 2, height: 3, x: 1, y: 0 },
            { id: '335', name: '335', type: 'room', width: 2, height: 2, x: 1, y: 3 },
            { id: '337', name: '337', type: 'room', width: 2, height: 1, x: 1, y: 6 },
            { id: '339', name: '339', type: 'room', width: 2, height: 2, x: 1, y: 7 },
            { id: '341', name: '341', type: 'room', width: 2, height: 2, x: 1, y: 9 },
            { id: '343', name: '343', type: 'room', width: 2, height: 2, x: 1, y: 11 },
            { id: '345', name: '345', type: 'room', width: 2, height: 1, x: 1, y: 13 },
            { id: '347', name: '347', type: 'room', width: 2, height: 2, x: 1, y: 15 },
            { id: '349', name: '349', type: 'room', width: 2, height: 3, x: 1, y: 17 },
            // Left side
            { id: '326', name: '326', type: 'room', width: 2, height: 3, x: -2, y: 0 },
            { id: '328', name: '328', type: 'room', width: 2, height: 2, x: -2, y: 3 },
            { id: '330', name: '330', type: 'room', width: 2, height: 1, x: -2, y: 5 },
            { id: '332', name: '332', type: 'room', width: 2, height: 2, x: -2, y: 6 },
            { id: '334', name: '334', type: 'room', width: 2, height: 1, x: -2, y: 8 },
            { id: '336', name: '336', type: 'room', width: 2, height: 3, x: -2, y: 9 },
            { id: '338', name: '338', type: 'room', width: 2, height: 3, x: -2, y: 12 },
            { id: '340', name: '340', type: 'room', width: 2, height: 2.5, x: -2, y: 15 },
            { id: '342', name: '342', type: 'room', width: 2, height: 2.5, x: -2, y: 17.5 },
        ]
    },
];
