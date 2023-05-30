import { Container, MultiSelect, Title, createStyles } from "@mantine/core";
import { useState } from "react";
import { api } from "../utils/api";
import type { DataIndex } from "@prisma/client";

const useStyles = createStyles((theme) => ({
    area: {
      backgroundColor: theme.colors.gray[0],
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
    },
    areaTitle: {
      fontSize: theme.fontSizes.md,
      marginBottom: theme.spacing.md,
    },
    editorWrapper: {
      marginTop: theme.spacing.md,
    },
    fullWidth: {
      width: "100%",
    },
  }));

export function DataIndexToCalendarEventEditor({spaceId, itemId, selectedDataIndex}: {spaceId: string, itemId: string, selectedDataIndex: DataIndex[]}) {
    const [searchDataIndexValue, onSearchDataIndexChange] = useState("");

    const dataIndexQuery = api.dataIndex.getDataIndicesForSpace.useQuery({
        spaceId,
      });

    const { classes } = useStyles();
    const utils = api.useContext();
    const addDataIndexMutation =
    api.calendarEvents.addDataIndexToCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  const removeDataIndexMutation =
    api.calendarEvents.removeDataIndicesFromCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });


    if(dataIndexQuery.isLoading) return <div>Loading...</div>
    if(dataIndexQuery.isError) return <div>Error...</div>
    if(dataIndexQuery.data === undefined) return <div>Undefined...</div>

    const dataIndexSelectValue = selectedDataIndex.map((dataIndex) => dataIndex.id);

    const dataIndexSelectedItems = dataIndexQuery.data.map((dataIndex) => ({
        value: dataIndex.dataIndex.id,
        label: dataIndex.dataIndex.title,
      }));

    
    return <Container size="sm" className={classes.area}>
    <Title className={classes.areaTitle} order={2}>
      Proposals
    </Title>
    <MultiSelect
      data={dataIndexSelectedItems}
      label="Connect data index"
      placeholder="You can select all data index in this space"
      searchable
      searchValue={searchDataIndexValue}
      onSearchChange={onSearchDataIndexChange}
      nothingFound="Nothing found"
      clearable
      onChange={(value) => {
        console.log(value);
        if (value.length === 0) {
          if (dataIndexSelectValue.length > 0) {
            removeDataIndexMutation.mutate({
              calendarEventId: itemId,
              dataIndexIds: dataIndexSelectValue,
            });
          } else {
            return;
          }
        }

        if(value.length < dataIndexSelectValue.length) { 
          const removedProposals = dataIndexSelectValue.filter((proposalId) => !value.includes(proposalId));
          removeDataIndexMutation.mutate({
            calendarEventId: itemId,
            dataIndexIds: removedProposals,
          });
          return;
        }

        const lastValue = value[value.length - 1];
        if (lastValue === undefined) return;
        addDataIndexMutation.mutate({
          calendarEventId: itemId,
          dataIndexId: lastValue,
        });
      }}
      value={dataIndexSelectValue}
    />
  </Container>
}