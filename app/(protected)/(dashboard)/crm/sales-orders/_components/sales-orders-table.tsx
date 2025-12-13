import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import SalesOrderActions from "./sales-order-actions";

type SalesOrder = {
  id: number;
  so_no: string;
  created_at: string;
  customer: string;
  email: string;
  quotation_no: string;
  items: number;
  total: number;
  status: string;
  lastUpdate: string;
};

type Props = {
  data: SalesOrder[];
  isSuperadmin?: boolean;
  onRowClick?: (id: number) => void;
};

export default function SalesOrdersTable({
  data,
  isSuperadmin,
  onRowClick,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No SO</TableHead>
          <TableHead>Tanggal Input</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>No Quotation</TableHead>
          <TableHead>Jumlah Item</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onRowClick?.(item.id)}
            >
              <TableCell>{item.so_no}</TableCell>
              <TableCell>{item.created_at}</TableCell>
              <TableCell>{item.customer}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.quotation_no}</TableCell>
              <TableCell>{item.items}</TableCell>
              <TableCell>{item.total.toLocaleString()}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.lastUpdate}</TableCell>
              <TableCell>
                <SalesOrderActions
                  item={item}
                  isSuperadmin={isSuperadmin}
                  // onView, onEdit, onDelete bisa diisi sesuai kebutuhan
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
              No sales orders found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
