import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../database/entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findById(id: string): Promise<Company | null> {
    return this.companiesRepository.findOne({ where: { id } });
  }


  async create(companyData: Partial<Company>): Promise<Company> {
    const company = this.companiesRepository.create(companyData);
    return this.companiesRepository.save(company);
  }

  async update(id: string, updateData: Partial<Company>): Promise<Company | null> {
    await this.companiesRepository.update(id, updateData);
    return this.findById(id);
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find();
  }
}
