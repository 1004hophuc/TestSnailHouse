export class CreateHistoryDto {
  amount?: number;
  account?: string;
  type?: string; // withdraw
  status?: string;
  txHash?: string;
}
