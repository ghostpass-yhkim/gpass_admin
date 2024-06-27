import React, { useEffect, useState } from "react"
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material"
import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  PublicOutlined,
  PointOfSaleOutlined,
  TodayOutlined,
  CalendarMonthOutlined,
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  PieChartOutlined,
  LocalParkingOutlined,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"
import FlexBetween from "./FlexBetween"
import utill from "lib/utill"
import gpassImage from "../assets/gpass.png"

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation()
  const [active, setActive] = useState("")
  const navigate = useNavigate()
  const theme = useTheme()

  const [navItems, setNavItems] = useState([])

  useEffect(() => {
    const user_level = utill.base64Decode(
      sessionStorage.getItem("x-a-d-l") ?? ""
    )

    if (user_level == 0) {
      const navItems = [
        {
          text: "호스트 계정",
          icon: null,
        },
        {
          text: "키오스크 리스트",
          icon: <ReceiptLongOutlined />,
          scene: "hostkiosks",
        },
        {
          text: "얼굴 등록 리스트",
          icon: <ReceiptLongOutlined />,
          scene: "hostfacials",
        },
        {
          text: "유저 등록",
          icon: <ReceiptLongOutlined />,
          scene: "updatefacial",
        },
        {
          text: "얼굴 인증 내역",
          icon: <ReceiptLongOutlined />,
          scene: "hosttransactions",
        },
      ]
      setNavItems(navItems)
    } else {
      const navItems = [
        {
          text: "대시보드",
          icon: <HomeOutlined />,
          scene: "dashboard",
        },
        {
          text: "사용자 관리",
          icon: null,
        },
        {
          text: "사용자",
          icon: <Groups2Outlined />,
          scene: "users",
        },
        {
          text: "(ALL)얼굴 등록 리스트",
          icon: <ReceiptLongOutlined />,
          scene: "facials",
        },
        {
          text: "(ALL)얼굴 인증 내역",
          icon: <ReceiptLongOutlined />,
          scene: "transactions",
        },
        {
          text: "호스트 관리",
          icon: null,
        },
        {
          text: "호스트 리스트",
          icon: <ReceiptLongOutlined />,
          scene: "hosts",
        },
        {
          text: "키오스크 관리",
          icon: null,
        },
        {
          text: "키오스크 리스트",
          icon: <ReceiptLongOutlined />,
          scene: "kiosks",
        },
        {
          text: "어드민 관리",
          icon: null,
        },
        {
          text: "어드민",
          icon: <Groups2Outlined />,
          scene: "admins",
        },
      ]
      setNavItems(navItems)
    }
  }, [])

  useEffect(() => {
    setActive(pathname.substring(1))
  }, [pathname])

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Box
                    mr="10px"
                    component="img"
                    alt="profile"
                    src={gpassImage}
                    height="25px"
                    width="55px"
                    sx={{ objectFit: "cover" }}
                  />
                  <Typography variant="h4" fontWeight="bold">
                    gpass
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon, scene }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  )
                }
                const lcText = scene.toLowerCase()

                return (
                  <ListItem key={scene} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${scene}`)
                        setActive(scene)
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === lcText
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === lcText
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === lcText && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  )
}

export default Sidebar
