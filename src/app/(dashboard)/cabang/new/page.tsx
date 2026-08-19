import BranchForm from "../BranchForm";

export const metadata = {
  title: "Tambah Cabang | CoreAuto POS",
};

export default function NewBranchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Cabang</h1>
        <p className="text-gray-500 mt-1">Masukkan informasi cabang bengkel baru.</p>
      </div>

      <BranchForm />
    </div>
  );
}
