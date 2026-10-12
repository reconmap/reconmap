import { useQueryClient } from "@tanstack/react-query";
import { requestRunnerPost } from "api/requests/runners";
import HorizontalLabelledField from "components/forms/HorizontalLabelledField";
import NativeButton from "components/forms/NativeButton";
import NativeInput from "components/forms/NativeInput";
import Breadcrumb from "components/ui/Breadcrumb";
import Title from "components/ui/Title";
import { actionCompletedToast, errorToast } from "components/ui/toast";
import { useState } from "react";

const RunnerCreatePage = () => {
    const queryClient = useQueryClient();
    const [runnerCredentials, setRunnerCredentials] = useState<any>(null);

    const onSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        requestRunnerPost(data).then((response) => {
            if (response.status === 201) {
                return response.json();
            } else {
                errorToast("Failed to add runner");
            }
        }).then((credentials) => {
            if (credentials) {
                event.target.reset();
                setRunnerCredentials(credentials);
                queryClient.invalidateQueries({ queryKey: ["runners"] });
                actionCompletedToast("The runner was added.");
            }
        });
    };

    return (
        <>
            <div className="heading">
                <Breadcrumb current="Add runner" />
            </div>
            <Title title="Add runner" />

            <form onSubmit={onSubmit}>
                <HorizontalLabelledField label="Name" control={<NativeInput type="text" name="name" placeholder="Name" required />} />

                <HorizontalLabelledField label="Hostname" control={<NativeInput type="text" name="hostname" placeholder="Hostname" required />} />

                <HorizontalLabelledField label="Listen Address" control={<NativeInput type="text" name="listenAddr" placeholder="Listen Address" required />} />

                <NativeButton type="submit" className="button is-primary">Add new runner</NativeButton>
            </form>

            {runnerCredentials && (
                <div className="mt-5">
                    The runner credentials are (please copy them as they are only displayed once):
                    <pre>{JSON.stringify(runnerCredentials, null, 2)}</pre>
                </div>
            )}
        </>
    );
};

export default RunnerCreatePage;
