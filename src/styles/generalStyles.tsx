import {createStyles } from "@mantine/core";

export const useGeneralStyles = createStyles((theme) => ({
    area: {
      backgroundColor: theme.white,
      borderRadius: theme.radius.md,
      marginTop: theme.spacing.md,
      padding: 0,
    },
    metaArea: {
      backgroundColor: theme.colors.gray[4],
      borderTopLeftRadius: theme.radius.md,
      borderTopRightRadius: theme.radius.md,
      padding: theme.spacing.md,
    },
    bodyArea: {
      padding: theme.spacing.md,
      marginTop: theme.spacing.xs,
    },
    areaTitle: {
      fontSize: theme.fontSizes.md,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.md,
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.xl,
      },
    mainTitle: {
      color: theme.black,
      fontSize: theme.fontSizes.xxl,
    },
    editorWrapper: {
      marginTop: theme.spacing.md,
    },
    inlineText: {
      display: "inline",
    },
      clearArea: {
        marginBottom: theme.spacing.md,
        marginTop: theme.spacing.md,
        color: theme.white,
        padding: 0
      },
      listHeader: {
        borderBottom: `2px solid ${theme.colors.earth[2]}`,
        marginTop: theme.spacing.xl,
        paddingBottom: theme.spacing.md,
        marginBottom: theme.spacing.xl,
      },
      
      listLinkItem: {
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.sm,
        backgroundColor: theme.white,
        paddingLeft: theme.spacing.md,
        color: theme.black,
        '&:hover': { 
          borderLeft: `0.5rem solid ${theme.colors.earth[2]}`,
          paddingLeft: '0.5rem', 
        }
      },
      topGroup: {
        alignItems: "flex-start",
      }
  }));