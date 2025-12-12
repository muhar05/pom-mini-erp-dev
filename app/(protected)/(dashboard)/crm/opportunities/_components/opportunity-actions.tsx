import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

type OpportunityActionsProps = {
  item: any;
  isSuperadmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function OpportunityActions({
  item,
  isSuperadmin,
  onEdit,
  onDelete,
}: OpportunityActionsProps) {
  return (
    <div className="flex gap-2">
      {/* View */}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        title="View"
        // onClick={...} // (opsional: tambahkan handler view jika perlu)
      >
        <Eye className="w-4 h-4" />
      </Button>
      {/* Edit */}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
        title="Edit"
        onClick={onEdit}
      >
        <Edit className="w-4 h-4" />
      </Button>
      {/* Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
        title="Delete"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
