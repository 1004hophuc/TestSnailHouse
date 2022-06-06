import { PartialType } from '@nestjs/mapped-types';
import { CreateDaoElementTransactionDto } from './create-dao-element-transaction.dto';

export class UpdateDaoElementTransactionDto extends PartialType(CreateDaoElementTransactionDto) {}
