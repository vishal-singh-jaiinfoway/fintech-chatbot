/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */
// import { primaryColors } from "@/themes/_muiPalette";
// import StopIcon from "@mui/icons-material/Stop";
// import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
// eslint-disable-next-line import/order
// import UpArrowIcon from "@/ui/Icons/UpArrowIcon";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import { styled } from "@mui/material";
import Button from "@mui/material/Button";
import TextField, { StandardTextFieldProps, TextFieldProps } from "@mui/material/TextField";

import React, { forwardRef } from "react";

const InputWrap = styled(TextField as any)`
  .MuiInputBase-adornedEnd {
    height: auto;
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 400;
    color: var(--white);
    border-radius: 0px;
    padding: 2.5px 16px;
    box-shadow: none;
    min-width: 300px;
    @media (max-width: 600px) {
      padding: 5px 10px;
    }

    input[type="text"],
    input[type="email"],
    input[type="url"],
    input[type="password"],
    input[type="search"],
    input[type="number"],
    input[type="tel"],
    input[type="range"],
    input[type="date"],
    input[type="month"],
    input[type="week"],
    input[type="time"],
    input[type="datetime"],
    input[type="datetime-local"],
    input[type="color"],
    textarea {
      border: 0;
      padding-left: 0;
      &::placeholder {
        opacity: 1;
      }
      &:focus {
        border: 0;
        background: transparent;
      }
    }
    textarea {
      padding: 20px 10px 20px 51px;
      @media (max-width: 600px) {
        padding: 20px 10px 20px 30px;
      }
    }
    &.Mui-error {
      input[type="text"],
      input[type="email"],
      input[type="url"],
      input[type="password"],
      input[type="search"],
      input[type="number"],
      input[type="tel"],
      input[type="range"],
      input[type="date"],
      input[type="month"],
      input[type="week"],
      input[type="time"],
      input[type="datetime"],
      input[type="datetime-local"],
      input[type="color"],
      textarea {
      }
    }
    .MuiOutlinedInput-notchedOutline {
      display: none;
      /* border-color: var(--primaryD3D7DF); */
    }
    #outlined-adornment-password {
      border: 0;
      padding: 0;
      height: 39px;
      font-size: 16px;
      &::placeholder {
        opacity: 1;
      }
    }
    button {
      background-color: transparent;
      color: var(--textPrimaryColor);
      padding: 0;
      &:focus {
        background-color: transparent;
        color: var(--textPrimaryColor);
      }
      &:hover {
        background-color: transparent;
        color: var(--textPrimaryColor);
      }
      img {
        position: static !important;
        transform: inherit !important;
        top: 0;
        left: 0;
        width: 20px;
      }
      svg {
        font-size: 20px;
      }
    }
  }
`;

interface SubmitButtonProps {
  isPassword?: boolean;
  adorMentIcon?: JSX.Element;
  activeButton: boolean;
  handleUpArrowClick?: () => void;
  handlePausedStream?: () => void;
  isStream: boolean;
}

const SubmitButton = forwardRef<HTMLInputElement, any>(
  (
    {
      isPassword = false,
      adorMentIcon,
      activeButton,
      handleUpArrowClick,
      handlePausedStream,
      isStream,
      ...others
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (
      event: React.MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
    };

    return (
      <InputWrap
        fullWidth
        variant="outlined"
        {...others}
        type={"text"}
        InputProps={{
          inputRef: ref,
          endAdornment: isPassword ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                disableRipple
              >
                i
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <IconButton
                onClick={isStream ? handlePausedStream : handleUpArrowClick}
                disableRipple
              >
                {isStream ? (
                  <Button variant="text">Loading</Button>
                ) : (
                  <Button variant="text">^</Button>
                )}
                {adorMentIcon}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }
);

SubmitButton.displayName = "SubmitButton";

export default SubmitButton;