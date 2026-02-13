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
            { id: '101', name: '101', type: 'room', width: 2, height: 1, x: 1, y: 1, hasPanorama: true, panoramaUrl: '/panoramas/101/pano.jpg', hasTag: true },
            { id: '102', name: '102', type: 'room', width: 2, height: 1, x: 3, y: 1 },
            { id: '103', name: '103', type: 'room', width: 2, height: 1, x: 5, y: 1 },
            { id: '104', name: '104', type: 'room', width: 2, height: 1, x: 7, y: 1 },
            { id: '105', name: '105', type: 'room', width: 2, height: 1, x: 9, y: 1 },
            { id: '106', name: '106', type: 'room', width: 2, height: 1, x: 11, y: 1 },
            { id: 'c1', name: 'Corridor', type: 'corridor', width: 12, height: 1, x: 1, y: 2 },
            { id: '107', name: '107', type: 'room', width: 3, height: 1, x: 1, y: 3 },
            { id: '108', name: '108', type: 'room', width: 3, height: 1, x: 4, y: 3 },
            { id: '109', name: '109', type: 'auditorium', width: 6, height: 1, x: 7, y: 3 },
            { id: 's1_up', name: 'Stairs Up', type: 'staircase', width: 1, height: 1, x: 3, y: 2 }
        ]
    },
    {
        level: 2,
        rooms: [
            { id: 'c3', name: 'Corridor', type: 'corridor', width: 1, height: 20, x: 0, y: 0 },
            // Right side
            { id: '319', name: '319', type: 'room', width: 2, height: 3, x: 1, y: 0 },
            { id: '321', name: '321', type: 'room', width: 2, height: 2, x: 1, y: 3 },
            { id: 'floor2_staircase1', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 5 },
            { id: '323', name: '323', type: 'room', width: 2, height: 2, x: 1, y: 6 },
            { id: '325', name: '325', type: 'room', width: 2, height: 3, x: 1, y: 8 },
            { id: '327', name: '327', type: 'room', width: 2, height: 3, x: 1, y: 11 },
            { id: 'floor2_staircase2', name: 'STAIRS', type: 'staircase', width: 2, height: 1, x: 1, y: 14 },
            { id: '329', name: '329', type: 'room', width: 2, height: 2, x: 1, y: 15, hasTag: true },
            { id: '331', name: '331', type: 'room', width: 2, height: 3, x: 1, y: 17 },
            //Left side
            { id: '312', name: '312', type: 'room', width: 2, height: 3, x: -2, y: 0, hasTag: true, hasPanorama: true, panoramaUrl: '/panoramas/312/pano.jpg' },
            { id: '314', name: '314', type: 'room', width: 2, height: 2.5, x: -2, y: 3 },
            { id: '316', name: '316', type: 'room', width: 2, height: 3, x: -2, y: 5.5 },
            { id: '319', name: '319', type: 'room', width: 2, height: 2.5, x: -2, y: 8.5 },
            { id: '320', name: '320', type: 'room', width: 2, height: 3, x: -2, y: 11 },
            { id: '322', name: '322', type: 'room', width: 2, height: 3, x: -2, y: 14 },
            { id: '324', name: '324', type: 'room', width: 2, height: 3, x: -2, y: 17, hasTag: true },
        ]
    },
    {
        level: 3,
        rooms: [
            { id: '201', name: '201', type: 'room', width: 2, height: 1, x: 1, y: 1 },
            { id: '202', name: '202', type: 'room', width: 2, height: 1, x: 3, y: 1 },
            { id: '203', name: '203', type: 'room', width: 2, height: 1, x: 5, y: 1 },
            { id: '204', name: '204', type: 'room', width: 2, height: 1, x: 7, y: 1 },
            { id: '205', name: '205', type: 'room', width: 2, height: 1, x: 9, y: 1 },
            { id: '206', name: '206', type: 'room', width: 2, height: 1, x: 11, y: 1 },
            { id: 'c2', name: 'Corridor', type: 'corridor', width: 12, height: 1, x: 1, y: 2 },
            { id: '207', name: '207', type: 'lab', width: 4, height: 1, x: 1, y: 3 },
            { id: '208', name: '208', type: 'lab', width: 4, height: 1, x: 5, y: 3 },
            { id: '209', name: '209', type: 'lab', width: 4, height: 1, x: 9, y: 3 },
            { id: 's3_down', name: 'Stairs Down', type: 'staircase', width: 1, height: 1, x: 3, y: 2 },
            { id: 's3_up', name: 'Stairs Up', type: 'staircase', width: 1, height: 1, x: 8, y: 2 }
        ]
    },
    {
        level: 4,
        rooms: [
            { id: '401', name: '401', type: 'room', width: 2, height: 1, x: 1, y: 1 },
            { id: '402', name: '402', type: 'room', width: 2, height: 1, x: 3, y: 1 },
            { id: 'c4', name: 'Corridor', type: 'corridor', width: 4, height: 12, x: 1, y: 2 },
            { id: '407', name: '407', type: 'room', width: 1, height: 1, x: 5, y: 2 },
        ]
    },
];
