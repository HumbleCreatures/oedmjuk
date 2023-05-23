import { DatePickerInput } from "@mantine/dates";
import { NumberInput, Alert, Button, SimpleGrid } from "@mantine/core";

import { IconCalendar } from "@tabler/icons-react";

import { useForm } from "@mantine/form";
import { api } from "../utils/api";
import { IconAlertCircle } from "@tabler/icons";

interface InputValues {
  datestamp: Date | undefined;
  value: number | undefined;
}

export function DataPointEditor({ dataIndexId }: { dataIndexId: string }) {
    const utils = api.useContext();
    const mutation = api.dataIndex.upsertDataIndexPoint.useMutation({
        onSuccess() {
          void utils.dataIndex.getDataIndex.invalidate({itemId: dataIndexId});
          void utils.dataIndex.getDataPointsForIndex.invalidate({dataIndexId: dataIndexId});
        },
      });

  const form = useForm<InputValues>({
    initialValues: {
      datestamp: undefined,
      value: undefined,
    },
    validate: {
      datestamp: (value) =>
        value === undefined ? "You have to enter a date." : null,
      value: (value) =>
        value === undefined ? "You have to enter a value" : null,
    },
  });

  return (
    
    <form
    onSubmit={form.onSubmit((values) => {
      console.log(values);
      if(!values.datestamp || !values.value) return;
      mutation.mutate({...values, dataIndexId: dataIndexId});
    })}
  >
    <SimpleGrid cols={1}>
      <DatePickerInput
        icon={<IconCalendar size="1.1rem" stroke={1.5} />}
        label="Pick date"
        placeholder="Pick date"
        {...form.getInputProps("datestamp")}
      />

      <NumberInput
        mt="xl"
        label="Number value for the chosen date"
        placeholder="NumberInput with custom layout"
        description="If there is a value for the chosen date, it will be overwritten."
        {...form.getInputProps("value")}
      />
      <div><Button type="submit" mt="sm">
            Add point
          </Button>
          </div>

     {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </SimpleGrid>
        </form>
  );
}
