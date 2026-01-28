import { JobApplicants } from "@/components/alumni/JobApplicants";
import { apiClient } from "@/lib/api";

const ApplicationsOverview = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <JobApplicants
        backPath="/admin/postings"
        detailsPath="/admin/applicant-details"
        heading="Applications Overview"
        loadJobs={apiClient.adminJobs}
        loadApplicants={() =>
          apiClient
            .adminApplications()
            .then((res) => res?.applications ?? [])
        }
      />
    </div>
  );
};

export default ApplicationsOverview;
