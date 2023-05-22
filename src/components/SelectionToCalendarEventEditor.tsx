import { Container, MultiSelect, Title, createStyles } from "@mantine/core";
import { useState } from "react";
import { api } from "../utils/api";
import type { Selection } from "@prisma/client";

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

export function SelectionToCalendarEventEditor({spaceId, itemId, selectedSelections}: {spaceId: string, itemId: string, selectedSelections: Selection[]}) {
    const [searchSelectionValue, onSearchSelectionChange] = useState("");

    const selectionQuery = api.selection.getActiveSelectionsForSpace.useQuery({
        spaceId,
      });

    const { classes } = useStyles();
    const utils = api.useContext();
    const addSelectionMutation =
    api.calendarEvents.addSelectionToCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });

  const removeSelectionMutation =
    api.calendarEvents.removeSelectionFromCalendarEvent.useMutation({
      onSuccess() {
        void utils.calendarEvents.getCalendarEvent.invalidate({ itemId });
      },
    });


    if(selectionQuery.isLoading) return <div>Loading...</div>
    if(selectionQuery.isError) return <div>Error...</div>
    if(selectionQuery.data === undefined) return <div>Undefined...</div>

    const selectionSelectValue = selectedSelections.map((selection) => selection.id);

    const selectionSelectItems = selectionQuery.data.map((selection) => ({
        value: selection.id,
        label: selection.title,
      }));

    
    return <Container size="sm" className={classes.area}>
    <Title className={classes.areaTitle} order={2}>
      Selections
    </Title>
    <MultiSelect
      data={selectionSelectItems}
      label="Connect selections"
      placeholder="You can only select created selections"
      searchable
      searchValue={searchSelectionValue}
      onSearchChange={onSearchSelectionChange}
      nothingFound="Nothing found"
      clearable
      onChange={(value) => {
        console.log(value);
        if (value.length === 0) {
          if (selectionSelectValue.length > 0) {
            removeSelectionMutation.mutate({
              calendarEventId: itemId,
              selectionIds: selectionSelectValue,
            });
          } else {
            return;
          }
        }

        if(value.length < selectionSelectValue.length) { 
          const removedProposals = selectionSelectValue.filter((proposalId) => !value.includes(proposalId));
          removeSelectionMutation.mutate({
            calendarEventId: itemId,
            selectionIds: removedProposals,
          });
          return;
        }

        const lastValue = value[value.length - 1];
        if (lastValue === undefined) return;
        addSelectionMutation.mutate({
          calendarEventId: itemId,
          selectionId: lastValue,
        });
      }}
      value={selectionSelectValue}
    />
  </Container>
}