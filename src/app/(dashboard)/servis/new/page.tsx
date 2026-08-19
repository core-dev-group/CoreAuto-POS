import ServiceForm from "../ServiceForm";

export const metadata = {
  title: "Tambah Jasa Servis | CoreAuto POS",
};

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tambah Jasa Servis</h1>
        <p className="text-gray-500 mt-1">Tambahkan layanan jasa baru yang disediakan oleh bengkel.</p>
      </div>

      <ServiceForm />
    </div>
  );
}
