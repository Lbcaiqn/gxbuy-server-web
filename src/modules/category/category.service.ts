import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {}

  async getCategoryData() {
    const data = await this.categoryRepository.find({
      relations: ['children', 'children.children'],
      where: { cat_level: 0 },
    });

    return data;
  }
}
