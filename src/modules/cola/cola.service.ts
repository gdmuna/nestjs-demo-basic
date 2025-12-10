import { Injectable } from '@nestjs/common';

@Injectable()
export class ColaService {
    private COLA_CATEGORY = new Map<string, ColaBrand>([
        [
            'Coca-Cola',
            {
                owner: '自宅警备员',
                name: 'Coca-Cola',
                tags: ['经典', '原味', '碳酸饮料'],
                description: '全球知名的碳酸饮料品牌，以其独特的口味和清爽的感觉著称。',
            },
        ],
    ]);

    RegisterCola(details: ColaBrand) {
        const brandName = details.name;
        this.COLA_CATEGORY.set(brandName, details);
    }

    getColaCategory(brand: string) {
        return this.COLA_CATEGORY.get(brand);
    }
}

interface ColaBrand {
    owner: string;
    name: string;
    tags?: string[];
    description?: string;
}
