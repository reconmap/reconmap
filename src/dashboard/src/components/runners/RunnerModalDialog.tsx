import { useQueryClient } from "@tanstack/react-query";
import { requestRunnerPost } from "api/requests/runners";
import Form from "components/forms/Form";
import FormField from "components/forms/FormField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import PrimaryButton from "components/ui/buttons/PrimaryButton";
import ModalDialog from "components/ui/ModalDialog";
import { toast } from "components/ui/toast";
import { useState } from "react";
import { HttpStatus } from "utilities/httpStatus";

const RunnerModalDialog = ({ isOpen, onClose }: any) => {
    const queryClient = useQueryClient();
    const [runnerCredentials, setRunnerCredentials] = useState<any>(null);

    const close = () => {
        setRunnerCredentials(null);
        onClose();
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const data = Object.fromEntries(new FormData(form).entries());
        requestRunnerPost(data)
            .then((response) => {
                if (response.status === HttpStatus.CREATED) {
                    return response.json();
                }
                toast.error("Failed to add runner");
            })
            .then((credentials) => {
                if (credentials) {
                    form.reset();
                    setRunnerCredentials(credentials);
                    queryClient.invalidateQueries({ queryKey: ["runners"] });
                    toast.success("The runner was added.");
                }
            });
    };

    return (
        <ModalDialog visible={isOpen} onModalClose={close} title="New runner">
            {runnerCredentials ? (
                <div>
                    <div>
                        The runner credentials are (please copy them as they are only displayed once):
                        <pre>{JSON.stringify(runnerCredentials, null, 2)}</pre>
                    </div>
                    <NativeButton onClick={close}>Close</NativeButton>
                </div>
            ) : (
                <div>
                    <Form id="runner-form" layout="vertical" onSubmit={onSubmit}>
                        <FormField label="Name" control={<NativeInput type="text" name="name" placeholder="Name" required autoFocus />} />

                        <FormField label="Hostname" control={<NativeInput type="text" name="hostname" placeholder="Hostname" required />} />

                        <FormField label="Listen Address" control={<NativeInput type="text" name="listenAddr" placeholder="Listen Address" required />} />
                    </Form>

                    <div>
                        <NativeButton onClick={close}>Cancel</NativeButton>
                        <PrimaryButton type="submit" form="runner-form">Save</PrimaryButton>
                    </div>
                </div>
            )}
        </ModalDialog>
    );
};

export default RunnerModalDialog;
