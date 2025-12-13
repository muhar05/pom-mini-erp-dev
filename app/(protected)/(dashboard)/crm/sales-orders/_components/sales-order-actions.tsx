import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

type SalesOrderActionsProps = {
  item: any;
  isSuperadmin?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function SalesOrderActions({
  item,
  isSuperadmin,
  onView,
  onEdit,
  onDelete,
}: SalesOrderActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        title="View"
        onClick={onView}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
        title="Edit"
        onClick={onEdit}
        disabled={!isSuperadmin}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        title="Delete"
        onClick={onDelete}
        disabled={!isSuperadmin}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
