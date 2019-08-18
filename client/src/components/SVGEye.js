import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

const moveEye = keyframes`
  0% {transform: translate(2px, -5px) ;}
  5% {transform: translate(-5px, -3px) ;}
  20% {transform: translate(-5px, -3px);}
  25% {transform: translate(-4px, 4px);}
  40% {transform: translate(-4px, 4px);}
  45% {transform: translate(2px, -5px);}
  60% {transform: translate(2px, -5px);}
  65% {transform: translate(4px, 0px);}
  80% {transform: translate(4px, 0px);}
  85% {transform: translate(2px, -5px);}
  100% {transform: translate(2px, -5px) ;}
`

const movePupil = keyframes`
  0% {transform: scale(1);}
  3% {transform: scale(1);}
  10% {transform: scale(1);}
  40% {transform:  scale(1.3);}
  80% {transform: scale(1.5);}
  85% {transform: scale(1);}
`
const dimSvg = keyframes`
  0% {filter: blur(2px) brightness(70%);}
  3% {filter: blur(2px) brightness(70%);}
  10% {filter: blur(3px) brightness(20%);}
  80% {filter: blur(4px) brightness(20%);}
  85% {filter: blur(2px) brightness(70%);}
`

const StyledSVG = styled.div`
  svg {
    transition: all 2s;
    /* animation: ${dimSvg} 8s linear infinite; */
  }
  #inner-eye {
    transition: all 0.4s;
    transform-origin: center;
    transform-box: fill-box;
    /* transform: translate(4px, -6px); */
    animation: ${moveEye} 4s linear infinite;
  }

  #pupil {
    transition: all 0.6s;
    transform-origin: center;
    transform-box: fill-box;
    animation: ${movePupil} 8s linear infinite;
  }
`

const SVGEye = () => {
  return (
    <StyledSVG>
      <svg xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 100.928 100.885">
        <defs>
          <linearGradient id="e">
            <stop offset={0} stopColor="#fff" />
            <stop offset={1} stopColor="#fff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="d">
            <stop offset={0} stopColor="#06f" />
            <stop offset={1} stopColor="#06f" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="c">
            <stop offset={0} stopColor="#0f6" />
            <stop offset={1} stopColor="#0f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="b">
            <stop offset={0} stopColor="#cbf5ff" />
            <stop offset=".523" stopColor="#6fe2ff" />
            <stop offset={1} stopColor="#00a2ca" />
          </linearGradient>
          <linearGradient id="a">
            <stop offset={0} stopColor="#fff" />
            <stop offset=".52" stopColor="#f6f6f6" />
            <stop offset=".799" stopColor="#e4e4e4" />
            <stop offset={1} stopColor="#828282" />
          </linearGradient>
          <radialGradient
            id="g"
            cx="-9.525"
            cy="114.437"
            r="47.36"
            fx="-9.525"
            fy="114.437"
            gradientTransform="translate(52.58 -71.31)"
            gradientUnits="userSpaceOnUse"
            xlinkHref="#a"
          />
          <radialGradient
            id="h"
            cx="-2.381"
            cy="118.671"
            r="22.8"
            fx="-2.381"
            fy="118.671"
            gradientTransform="translate(52.85 -84.768) scale(1.1134)"
            gradientUnits="userSpaceOnUse"
            xlinkHref="#b"
          />
          <radialGradient
            id="i"
            cx="-2.381"
            cy="141.121"
            r="22.8"
            fx="-2.381"
            fy="141.121"
            gradientTransform="matrix(1.63417 0 0 1.63417 54.09 -158.26)"
            gradientUnits="userSpaceOnUse"
            xlinkHref="#c"
          />
          <radialGradient
            id="j"
            cx="-2.381"
            cy="91.73"
            r="22.8"
            fx="-2.381"
            fy="91.73"
            gradientTransform="matrix(1.89 0 0 1.89 54.7 -156.005)"
            gradientUnits="userSpaceOnUse"
            xlinkHref="#d"
          />
          <linearGradient
            id="k"
            x1="-3.574"
            x2="-3.574"
            y1="95.917"
            y2="115.76"
            gradientTransform="translate(52.85 -84.768) scale(1.1134)"
            gradientUnits="userSpaceOnUse"
            xlinkHref="#e"
          />
          <filter id="f" width="1.154" height="2.312" x="-.077" y="-.656" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="3.037" />
          </filter>
        </defs>
        <ellipse
          cx="-2.646"
          cy="163.915"
          filter="url(#f)"
          opacity=".852"
          rx="47.36"
          ry="5.556"
          transform="matrix(.92341 0 0 .6138 52.907 -7.609)"
        />
        <circle cx="50.199" cy="47.36" r="47.36" fill="url(#g)" />
        <g id="inner-eye">
          <circle cx="50.199" cy="47.36" r="26.218" fill="#214478" />
          <circle cx="50.199" cy="47.36" r="25.385" fill="url(#h)" />
          <circle cx="50.199" cy="47.36" r="25.385" fill="url(#i)" />
          <circle cx="50.199" cy="47.36" r="25.385" fill="url(#j)" />
          <path
            fill="#fff"
            d="M62.884 69.33L54.511 56.4l4.78 14.645-6.247-14.082 2.43 15.212-3.967-14.885.02 15.405-1.59-15.323-2.39 15.219.827-15.383-4.74 14.657 3.222-15.064-6.975 13.735 5.54-14.374-9.039 12.475 7.72-13.33-10.878 10.906 9.71-11.959-12.45 9.072 11.462-10.293-13.717 7.012 12.93-8.373-14.644 4.78 14.082-6.247-15.213 2.43 14.886-3.967-15.405.02 15.323-1.59-15.219-2.39 15.383.827-14.657-4.74 15.064 3.222-13.736-6.975 14.375 5.54-12.475-9.039 13.33 7.72-10.907-10.878 11.96 9.71-9.072-12.45 10.293 11.462-7.012-13.717 8.373 12.93-4.78-14.644 6.247 14.082-2.43-15.213 3.967 14.886-.02-15.405 1.59 15.323 2.39-15.219-.827 15.383 4.74-14.657-3.222 15.064 6.975-13.736-5.54 14.375 9.038-12.475-7.72 13.33 10.879-10.907-9.71 11.96 12.45-9.072-11.462 10.293 13.717-7.012-12.931 8.373 14.645-4.78-14.082 6.247 15.212-2.43-14.885 3.967 15.405-.02-15.323 1.59 15.219 2.39-15.383-.827 14.657 4.74-15.064-3.222 13.735 6.975-14.374-5.54 12.475 9.039-13.331-7.72 10.907 10.878-11.959-9.71 9.072 12.45-10.293-11.462z"
            opacity=".558"
          />
          <circle id="pupil" cx="50.199" cy="47.36" r="9.132" />
          <circle cx="50.199" cy="37.639" r="15.024" fill="url(#k)" opacity=".656" />
          <circle cx="56.091" cy="39.996" r="4.124" fill="#fff" opacity=".886" />
          <circle cx="44.013" cy="54.136" r="2.062" fill="#fff" opacity=".924" />
        </g>
        <path
          fill="#fff"
          d="M38.029 5.74a43.392 43.392 0 0 0-17.914 10.437l3.51 3.51a38.378 38.378 0 0 1 14.404-8.73zm0 6.927a36.73 36.73 0 0 0-13.265 8.16l4.883 4.882a29.898 29.898 0 0 1 8.382-5.616zm-19.013 4.612a43.392 43.392 0 0 0-10.44 17.91h5.22a38.379 38.379 0 0 1 8.729-14.403zm4.648 4.647a36.731 36.731 0 0 0-8.157 13.264h7.41a29.898 29.898 0 0 1 5.646-8.365z"
          opacity=".65"
        />
      </svg>
    </StyledSVG>
  )
}

export default SVGEye
