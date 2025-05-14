import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
}) {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };
  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={onClose}
      className="bg-slate-900"
      hideCloseButton={true}
    >
      <ModalContent className="max-h-[90vh] w-full max-w-md md:max-w-lg overflow-y-auto border border-gray-600 rounded-lg">
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 py-3 text-center">
              Add a Job Application
            </ModalHeader>
            <ModalBody className="py-2">
              <form
                id="jobForm"
                onSubmit={handleFormSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="job_title"
                    className="text-sm font-medium text-left"
                  >
                    Job Title
                  </label>
                  <Input
                    id="job_title"
                    name="job_title"
                    placeholder="Enter job title"
                    value={formData.job_title}
                    onChange={onChange}
                    variant="bordered"
                    isRequired
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>

                {/* Repeat the pattern for other fields with reduced gap and sm size */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="company_name" className="text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="Enter company name"
                    value={formData.company_name}
                    onChange={onChange}
                    variant="bordered"
                    isRequired
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>

                {/* ...other fields with same pattern... */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={onChange}
                    variant="bordered"
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="applied_date" className="text-sm font-medium">
                    Applied Date
                  </label>
                  <Input
                    id="applied_date"
                    name="applied_date"
                    type="date"
                    value={formData.applied_date}
                    onChange={onChange}
                    variant="bordered"
                    isRequired
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="application_url"
                    className="text-sm font-medium"
                  >
                    Application URL
                  </label>
                  <Input
                    id="application_url"
                    name="application_url"
                    placeholder="Enter application URL"
                    value={formData.application_url}
                    onChange={onChange}
                    variant="bordered"
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="salary" className="text-sm font-medium">
                    Salary
                  </label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="Enter salary"
                    type="number"
                    value={formData.salary}
                    onChange={onChange}
                    variant="bordered"
                    label=""
                    size="sm"
                    classNames={{
                      input:
                        "text-white placeholder:text-gray-400 focus:outline-none",
                      inputWrapper:
                        "bg-[#1C1C1E] border-none rounded-md h-12 px-4 focus:ring-0",
                      innerWrapper: "border-none",
                      base: "border-none",
                    }}
                    className="w-full -ml-2 border border-white/20 rounded-md"
                  />
                </div>
              </form>
            </ModalBody>
            <ModalFooter className="py-2 flex justify-center gap-2">
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                size="sm"
                className="border rounded-2xl border-white/30"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={onSubmit}
                size="sm"
                className="border rounded-2xl border-white/30"
              >
                Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
