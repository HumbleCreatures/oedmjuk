import {createStyles, getStylesRef } from "@mantine/core";

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
      cardInfoArea: {
        backgroundColor: theme.colors.gray[4],
        padding: theme.spacing.sm,
        paddingLeft: '2rem',
        marginLeft: '-1rem',
        borderTopLeftRadius: theme.radius.md,
        borderTopRightRadius: theme.radius.md,
        ref: getStylesRef('cardInfoArea'),
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
          [`& .${getStylesRef('cardInfoArea')}`]: {
            marginLeft: '-0.5rem',
            paddingLeft: '1.5rem',
              borderTopLeftRadius: 0, 
          }, 
        }
      },
      topGroup: {
        alignItems: "flex-start",
      },
      
      cardContentArea: {
        padding: theme.spacing.sm,
        alignItems: "flex-start",
      }
  }));