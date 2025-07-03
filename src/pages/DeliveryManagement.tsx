
import DashboardLayout from "@/components/DashboardLayout";
import DeliveryManagement from "@/components/admin/DeliveryManagement";

const DeliveryManagementPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <DeliveryManagement />
      </div>
    </DashboardLayout>
  );
};

export default DeliveryManagementPage;
