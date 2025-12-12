type OpportunityDetailDrawerProps = {
  opportunity: any;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function OpportunityDetailDrawer({
  opportunity,
}: OpportunityDetailDrawerProps) {
  return (
    <button>
      Detail
      {/* Modal/Drawer detail info */}
    </button>
  );
}
