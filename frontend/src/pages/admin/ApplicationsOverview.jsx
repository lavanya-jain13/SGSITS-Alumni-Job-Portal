import { JobApplicants } from "@/components/alumni/JobApplicants";
import { apiClient } from "@/lib/api";

const ApplicationsOverview = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <JobApplicants
        backPath="/admin/postings"
        detailsPath="/admin/applicant-details/:applicationId"
        heading="Applications Overview"
        loadJobs={apiClient.adminJobs}
        loadApplicants={(jobId) =>
          jobId
            ? apiClient
                .adminJobApplicants(jobId)
                .then((res) => res?.applicants ?? [])
            : Promise.resolve([])
        }
      />
    </div>
  );
};

export default ApplicationsOverview;
