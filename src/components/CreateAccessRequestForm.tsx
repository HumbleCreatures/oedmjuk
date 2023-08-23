import { useForm } from "@mantine/form";
import type { AccessRequestType } from "@prisma/client";
import { Alert, Button, Text, Box, Select } from "@mantine/core";
import EditorJsRenderer from "./EditorJsRenderer";
import type { OutputData } from '@editorjs/editorjs';
import { DynamicBlockEditor } from "./DynamicBlockEditor";
import { api } from "../utils/api";
import { useRouter } from "next/router";
import { forwardRef } from "react";
import { IconAlertCircle, IconBox, IconUser } from "@tabler/icons";

type FormInputType = {
    body: string,
    onBehalfOfUserId: string | undefined,
    onBehalfOfSpaceId: string | undefined
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
    value: string;
    label: string;
  }
  
const SelectItemUser = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
            <Text size="sm">{label}</Text>
            <Text size="xs" opacity={0.65}>
            </Text>
      </div>
    )
  );

  SelectItemUser.displayName = 'UserSelectItem';

  const SelectItemSpace = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
            <Text size="sm">{label}</Text>
      </div>
    )
  );

  SelectItemSpace.displayName = 'SpaceSelectItem';

export function CreateAccessRequestForm({accessRequestType}: {accessRequestType: AccessRequestType}) {
    
    const form = useForm<FormInputType>({
        initialValues: {
          body: "",
          onBehalfOfUserId: undefined,
          onBehalfOfSpaceId: undefined,
        },
        validate: {
            onBehalfOfUserId: (value) =>
                value === undefined && accessRequestType.onBehalfOfUserIsRequired === true ? "You have choose a behalf of user" : null, 
            onBehalfOfSpaceId: (value) =>
                value === undefined && accessRequestType.onBehalfOfSpaceIsRequired === true ? "You have choose a behalf of space" : null, 
        },
      });
      const router = useRouter();
      const utils = api.useContext();

      const allUsersResult = api.user.getAllUser.useQuery();
      const allSpacesResult = api.space.getAllSpaces.useQuery();


      const mutation = api.accessRequest.createAccessRequest.useMutation({
        onSuccess(data) {
          void utils.space.getSpace.invalidate();
          void router.push(`/app/space/${accessRequestType.spaceId}/accessRequest/${data.id}`);
        },
      });

      if(allUsersResult.isLoading || allSpacesResult.isLoading) return <div>Loading...</div>;

      
      const selectableUsers = allUsersResult.data?.map((user) => ({
        value: user.id,
        label: user.name ? user.name : "no name",
      }));

      const selectableSpaces = allSpacesResult.data?.map((space) => ({
        value: space.id,
        label: space.name ? space.name : "no name",
      }));
    
      return <>
        <Text mt="sm" size="xs" opacity={0.65}>
            <Text size="xs" fw={500}>{accessRequestType.name}</Text>
            {accessRequestType.description && <EditorJsRenderer data={accessRequestType.description} />}    
        </Text>
        <form
          onSubmit={form.onSubmit((values) => {
            mutation.mutate({...values, accessRequestTypeId: accessRequestType.id});
          })}
        >

        {(accessRequestType.onBehalfOfUserIsRequired || accessRequestType.hasOnBehalfOfUser) && selectableUsers &&
        
        <Select
            label="Choose behalf of user"
            placeholder="Pick one"
            itemComponent={SelectItemUser}
            data={selectableUsers}
            searchable
            maxDropdownHeight={400}
            nothingFound="Nobody here"
            icon={<IconUser size="1rem" />}
           
            filter={(value, item) =>
                item.label ? item.label.toLowerCase().includes(value.toLowerCase().trim()) : true 
            }
            onChange={(value) => {
                console.log(value);
                form.setFieldValue('onBehalfOfUserId', value ? value : undefined);
            }}
            /> }
{(accessRequestType.onBehalfOfSpaceIsRequired || accessRequestType.hasOnBehalfOfSpace) && selectableSpaces && 
            <Select
            label="Choose behalf of space"
            placeholder="Pick one"
            itemComponent={SelectItemUser}
            data={selectableSpaces}
            searchable
            maxDropdownHeight={400}
            nothingFound="Nobody here"
            icon={<IconBox size="1rem" />}
            onChange={(value) => {
              form.setFieldValue('onBehalfOfSpaceId', value ? value : undefined);
          }}

            filter={(value, item) =>
                item.label ? item.label.toLowerCase().includes(value.toLowerCase().trim()) : true 
            }
            /> }

          <Box mb="sm">

          <div>
          <Text fz="sm" fw={500}>Body</Text>
          <DynamicBlockEditor holder="blockeditor-container" onChange={(data:OutputData) => {
            form.setFieldValue('body', JSON.stringify(data))}}  />
          </div>
          </Box>

          <Button type="submit" mt="sm">
            Create
          </Button>
            
          {mutation.error && 
           <Alert icon={<IconAlertCircle size={16} />} title="Bummer!" color="red">Something went wrong! {mutation.error.message}</Alert>}
        </form>
      </>
} 