type OpportunityEditFormProps = {
  mode: "add" | "edit";
  opportunity?: any;
  onClose?: () => void;
  // onSuccess?: () => void;
};

export default function OpportunityEditForm({
  mode,
  opportunity,
  onClose,
}: OpportunityEditFormProps) {
  return (
    <button>
      {mode === "edit" ? "Edit" : "Add"} Opportunity
      {/* Modal/Form {mode} opportunity */}
    </button>
  );
}
