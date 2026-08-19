import ProductForm from "../ProductForm";

export const metadata = {
  title: "Tambah Barang | CoreAuto POS",
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Barang</h1>
        <p className="text-gray-500 mt-1">Masukkan informasi sparepart atau barang baru ke dalam sistem.</p>
      </div>

      <ProductForm />
    </div>
  );
}
