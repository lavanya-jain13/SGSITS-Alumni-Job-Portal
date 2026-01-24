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
        loadApplicants={(jobId) =>
          apiClient
            .adminJobApplications(jobId)
            .then((res) => res?.applicants ?? [])
        }
      />
    </div>
  );
};

export default ApplicationsOverview;
