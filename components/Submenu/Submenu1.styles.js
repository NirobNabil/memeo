import styled from "styled-components";

export const Container = styled.div`
  padding: 40px 60px 40px 30px;
`;

export const LinkContainer = styled.div`
  padding: 10px;
  cursor: pointer;
  border-width: 0 0 1px 0;
  border-radius: var(--radius);

  div.icon {
    width: 30px;
    font-size: 24px;
    align-self: center;
  }

  div.text {
    align-self: center;
    font-size: 18px;
  }

  &:hover {
    color: var(--primary-color);
  }
`;