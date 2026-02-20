import CampaignForm from "@/components/admin/CampaignForm";

export default function NewCampaignPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">New Campaign</h1>
        <p className="admin-page-subtitle">Create a new fundraising campaign</p>
      </div>
      <CampaignForm />
    </div>
  );
}