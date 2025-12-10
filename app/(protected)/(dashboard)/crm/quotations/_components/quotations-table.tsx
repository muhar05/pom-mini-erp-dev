type Quotation = {
  no: string;
  date: string;
  customer: string;
  email: string;
  sales: string;
  type: string;
  company: string;
  total: number;
  status: string;
  lastUpdate: string;
};

type QuotationsTableProps = {
  isSuperadmin?: boolean;
  data?: Quotation[];
};

export default function QuotationsTable({
  isSuperadmin,
  data = [],
}: QuotationsTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>No Quotation</th>
          <th>Tanggal Input</th>
          <th>Nama Customer</th>
          <th>Email</th>
          <th>Sales PIC</th>
          <th>Type</th>
          <th>Perusahaan</th>
          <th>Total Harga</th>
          <th>Status</th>
          <th>Last Update</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item, idx) => (
            <tr key={item.no}>
              <td>{item.no}</td>
              <td>{item.date}</td>
              <td>{item.customer}</td>
              <td>{item.email}</td>
              <td>{item.sales}</td>
              <td>{item.type}</td>
              <td>{item.company}</td>
              <td>{item.total.toLocaleString()}</td>
              <td>{item.status}</td>
              <td>{item.lastUpdate}</td>
              <td>{/* Action button/icon di sini */}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={11} className="text-center py-8 text-gray-500">
              No quotations found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
