// Allow TypeScript to import CSS files as side effects
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
