import { primaryColors } from "./_muiPalette";
import { styled } from "@mui/material";
import Box from "@mui/material/Box";

export const CybersecuritySecWrapper = styled(Box, {
  shouldForwardProp: (data) => data !== "isVideo"
})<{ isVideo: boolean }>`
  padding: 120px 0 50px;
  @media (max-width: 899px) {
    padding: 80px 0;
  }
  .breach_title {
    max-width: 538px;
    h3 {
      color: ${primaryColors?.primary1};
      margin-bottom: 15px;
    }
    > p {
      font-weight: 700;
    }
  }
  .chat_sec {
    width: 100%;
    margin-left: auto;
    border-radius: 30px;
    border: 1px solid ${primaryColors.primary};
    padding: 7px;
    background-color: ${primaryColors.white};
    @media (max-width: 899px) {
      width: 100%;
    }
    .MuiFormControl-root {
      textarea {
        padding: 10px 24px;
        height: 86px !important;
        color: ${primaryColors.color77787B};
        font-style: italic;
        @media (max-width: 899px) {
          height: 60px !important;
          padding: 10px 0px;
        }
        &::-webkit-input-placeholder {
          color: ${primaryColors.color77787B};
          font-style: italic;
        }

        &::-moz-placeholder {
          color: ${primaryColors.color77787B};
          font-style: italic;
        }

        &:-ms-input-placeholder {
          color: ${primaryColors.color77787B};
          font-style: italic;
        }

        &:-moz-placeholder {
          color: ${primaryColors.color77787B};
          font-style: italic;
        }
      }
      .MuiInputBase-root {
        border-radius: 23px;
        border: 1px solid ${primaryColors.primary};
        min-width: 100%;
      }
    }
    .chat_texts {
      padding: 40px;
      overflow-y: auto;
      height: 510px;
      @media (max-width: 899px) {
        padding: 10px;
      }
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
      }

      &::-webkit-scrollbar-thumb {
        background-color: ${primaryColors.border_primary};
      }
      p {
        color: ${primaryColors.color77787B};
        font-style: italic;
      }
    }
  }
  .cybr_btm {
    position: relative;
    margin-top: 25px;
    padding-bottom: 56.25%;
    overflow: hidden;
    @media (max-width: 899px) {
      height: 620px;
    }
    video {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      object-fit: cover;
      pointer-events: none;
      opacity: ${({ isVideo }) => (!isVideo ? 0 : 1)};
    }
    .chat_upr {
      position: absolute;
      top: 50%;
      right: 0;
      margin: auto;
      left: 0;
      transform: translateY(-50%);
    }
  }
`;
