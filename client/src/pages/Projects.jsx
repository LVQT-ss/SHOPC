import CallToAction from "../components/CallToAction";

export default function Projects() {
  return (
    <div className="min-h-screen max-w-2xl mx-auto flex justify-center items-center flex-col gap-6 p-3">
      <h1 className="text-3xl font-semibold">MÁY TÍNH QT</h1>
      <p className="text-md text-gray-500">
        Xây dựng cấu hình và gear ngay bây giờ
      </p>
      <CallToAction />
    </div>
  );
}
