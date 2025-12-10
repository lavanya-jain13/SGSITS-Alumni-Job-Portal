import { JobApplicants } from "@/components/alumni/JobApplicants";
import { apiClient } from "@/lib/api";

const ApplicationsOverview = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <JobApplicants
        backPath="/admin/postings"
        detailsPath="/alumni/applicant-details"
        heading="Applications Overview"
        loadJobs={apiClient.adminJobs}
        loadApplicants={(jobId) =>
          apiClient.adminJobApplicants(jobId).then((res) => res?.applicants || [])
        }
      />
    </div>
  );
};

export default ApplicationsOverview;
