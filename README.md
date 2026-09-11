<h1 align="center">🧹 limpação — front-end</h1>

<p align="center">
  Interface do <strong>limpação</strong> construída com <strong>React + Vite</strong>,
  organizada em <strong>Atomic Design</strong>.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
  <img alt="ESLint" src="https://img.shields.io/badge/ESLint-configurado-4B32C3?logo=eslint&logoColor=white">
</p>

---

## 📑 Índice

- [🚀 Começando](#-começando)
- [🗂️ Estrutura](#️-estrutura)
- [🧩 Padrão de componente](#-padrão-de-componente)
- [🎨 Tokens de cor](#-tokens-de-cor)
- [⚛️ Átomos](#️-átomos)
- [🧪 Moléculas](#-moléculas)
- [🛠️ Utils](#️-utils)
- [📜 Scripts](#-scripts)

---

## 🚀 Começando

```bash
npm install      # instala as dependências
npm run dev      # sobe o ambiente de desenvolvimento
```

---

## 🗂️ Estrutura

Os componentes seguem **Atomic Design** dentro de `src/components/`:

```
src/components/
├── atomos/       → peças básicas e reutilizáveis (Botao, InputTexto, Checkbox…)
├── moleculas/    → combinação de átomos (CampoFormulario…)
└── utils/        → helpers
```

---

## 🧩 Padrão de componente

Cada componente mora na própria pasta com **`Componente.jsx` + `Componente.css`**:

- `import "./Componente.css"` no topo
- **arrow function** com props em português desestruturadas
- `const estilos = ["nome_root"]` + `switch (cor)` empurrando os modificadores
- `style` inline para `largura` / `altura`
- classes no formato `nome_root`, `nome_primario`, `nome_erro`
- `export default` no fim

```jsx
import "./Distintivo.css";

const Distintivo = ({ texto, cor, icone }) => {
  const estilos = ["distintivo_root"];

  switch (cor) {
    case "primaria":
      estilos.push("distintivo_primario");
      break;
    case "erro":
      estilos.push("distintivo_erro");
      break;
    default:
      estilos.push("distintivo_padrao");
      break;
  }

  return (
    <span className={estilos.join(" ")}>
      {icone && <span className="distintivo_icone">{icone}</span>}
      {texto}
    </span>
  );
};

export default Distintivo;
```

---

## 🎨 Tokens de cor

As cores vêm de variáveis CSS:

| Variável | Uso |
|---|---|
| `--cor-primaria` | ação principal |
| `--cor-info` | ação secundária |
| `--cor-cinza` | neutro / padrão |
| `--cor-erro` | erro / alerta |
| `--cor-texto-claro` | texto sobre fundo colorido |
| `--cor-texto-escuro` | texto sobre fundo claro |

A prop `cor` aceita: **`"primaria"`**, **`"secundaria"`**, **`"erro"`** ou **`"padrao"`** (default).

---

## ⚛️ Átomos

`src/components/atomos/`

### `Botao`

`<button>` com variações de cor e ícone opcional.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `texto` | `string` | — | rótulo do botão |
| `cor` | `string` | `"padrao"` | variação visual |
| `icone` | `node` | — | ícone ao lado do texto |
| `aoClicar` | `func` | — | handler de clique |
| `largura` / `altura` | `string` | — | dimensões via `style` |
| `desabilitado` | `bool` | `false` | desativa o botão |

```jsx
<Botao texto="Salvar" cor="primaria" aoClicar={salvar} />
```

### `InputTexto`

`<input>` de texto — também suporta `tipo="file"`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `valor` | `string` | — | valor controlado |
| `tipo` | `string` | `"text"` | tipo do input |
| `placeholder` | `string` | `"Digite aqui"` | texto de dica |
| `cor` | `string` | `"padrao"` | variação visual |
| `aoAlterar` / `aoBlur` | `func` | — | handlers |
| `largura` / `altura` | `string` | `250px` / `50px` | dimensões |
| `desabilitado` | `bool` | `false` | desativa o campo |

```jsx
<InputTexto valor={nome} aoAlterar={(e) => setNome(e.target.value)} />
```

### `AreaTexto`

`<textarea>` com `linhas` e redimensionamento vertical.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `valor` | `string` | — | valor controlado |
| `placeholder` | `string` | `"Digite aqui"` | texto de dica |
| `cor` | `string` | `"padrao"` | variação visual |
| `aoAlterar` / `aoBlur` | `func` | — | handlers |
| `largura` / `altura` | `string` | `250px` / `120px` | dimensões |
| `linhas` | `number` | `4` | altura inicial em linhas |
| `desabilitado` | `bool` | `false` | desativa o campo |

```jsx
<AreaTexto valor={obs} aoAlterar={(e) => setObs(e.target.value)} linhas={6} />
```

### `Rotulo`

`<label>` para formulários, com `*` quando `obrigatorio`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `texto` | `string` | — | texto do rótulo |
| `para` | `string` | — | `htmlFor` do campo associado |
| `cor` | `string` | `"padrao"` | variação visual |
| `obrigatorio` | `bool` | `false` | mostra o asterisco |

```jsx
<Rotulo texto="E-mail" para="email" obrigatorio />
```

### `Selecao`

`<select>` que recebe `opcoes={[{ valor, texto }]}`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `valor` | `string` | — | opção selecionada |
| `opcoes` | `array` | `[]` | `{ valor, texto }` |
| `placeholder` | `string` | `"Selecione"` | opção inicial desabilitada |
| `cor` | `string` | `"padrao"` | variação visual |
| `aoAlterar` / `aoBlur` | `func` | — | handlers |
| `largura` / `altura` | `string` | `250px` / `50px` | dimensões |
| `desabilitado` | `bool` | `false` | desativa o campo |

```jsx
<Selecao
  valor={cidade}
  opcoes={[
    { valor: "recife", texto: "Recife" },
    { valor: "olinda", texto: "Olinda" },
  ]}
  aoAlterar={(e) => setCidade(e.target.value)}
/>
```

### `Checkbox`

Checkbox com texto ao lado.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `marcado` | `bool` | `false` | estado do checkbox |
| `texto` | `string` | — | rótulo ao lado |
| `cor` | `string` | `"padrao"` | cor de destaque (`accent-color`) |
| `aoAlterar` | `func` | — | handler |
| `desabilitado` | `bool` | `false` | desativa o campo |

```jsx
<Checkbox marcado={aceito} texto="Aceito os termos" aoAlterar={() => setAceito(!aceito)} />
```

### `Distintivo`

Badge / tag colorida.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `texto` | `string` | — | conteúdo do badge |
| `cor` | `string` | `"padrao"` | variação visual |
| `icone` | `node` | — | ícone antes do texto |

```jsx
<Distintivo texto="Concluído" cor="primaria" />
```

---

## 🧪 Moléculas

`src/components/moleculas/`

### `CampoFormulario`

Junta **`Rotulo` + `InputTexto` + mensagem de erro**. Aplica `cor="erro"` automaticamente quando recebe a prop `erro`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | `string` | — | liga o rótulo ao campo |
| `rotulo` | `string` | — | texto do `Rotulo` |
| `valor` | `string` | — | valor controlado |
| `tipo` | `string` | `"text"` | tipo do input |
| `placeholder` | `string` | — | texto de dica |
| `aoAlterar` / `aoBlur` | `func` | — | handlers |
| `obrigatorio` | `bool` | `false` | asterisco no rótulo |
| `erro` | `string` | — | mensagem de erro (ativa o estado de erro) |
| `largura` | `string` | `250px` | largura do bloco |

```jsx
<CampoFormulario
  id="email"
  rotulo="E-mail"
  valor={email}
  aoAlterar={(e) => setEmail(e.target.value)}
  obrigatorio
  erro={emailInvalido ? "E-mail inválido" : ""}
/>
```

### `InputComLabel`

Versão mais completa do campo de formulário: **`Rotulo` + `InputTexto` + erro / dica**,
com **botão de mostrar/ocultar senha** automático quando `tipo="password"`. Entra em
estado de erro sempre que recebe `mensagemErro`.

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | `string` | — | `htmlFor` do rótulo |
| `label` | `string` | — | texto do `Rotulo` |
| `tipo` | `string` | `"text"` | tipo do input (`text`, `email`, `tel`, `password`…) |
| `placeholder` | `string` | `"Digite aqui"` | texto de dica no campo |
| `valor` | `string` | — | valor controlado |
| `aoAlterar` / `aoBlur` | `func` | — | handlers |
| `obrigatorio` | `bool` | `false` | asterisco no rótulo |
| `desabilitado` | `bool` | `false` | desativa o campo |
| `mensagemErro` | `string` | `""` | erro exibido abaixo (ativa `cor="erro"`) |
| `dica` | `string` | `""` | texto auxiliar (some quando há erro) |
| `largura` / `altura` | `string` | `250px` / `50px` | dimensões |

```jsx
<InputComLabel
  label="Telefone"
  tipo="tel"
  placeholder="Digite seu telefone"
  valor={telefone}
  aoAlterar={(e) =>
    setTelefone(formatarComMascara(e.target.value, MASCARA_TELEFONE))
  }
  obrigatorio
  largura="100%"
  mensagemErro={erroTelefone()}
/>
```

---

## 🛠️ Utils

`src/components/utils/`

### `mascaras.js`

Máscaras onde cada `#` é substituído por um dígito.

| Export | Descrição |
|---|---|
| `MASCARA_TELEFONE` | `(##) #####-####` |
| `MASCARA_CPF` / `MASCARA_CNPJ` | documentos |
| `MASCARA_CEP` | `#####-###` |
| `MASCARA_DATA` | `##/##/####` |
| `formatarComMascara(valor, mascara)` | aplica a máscara ao valor |
| `removerMascara(valor)` | devolve só os dígitos |

```js
import { formatarComMascara, MASCARA_TELEFONE } from "../../utils/mascaras";

formatarComMascara("11987654321", MASCARA_TELEFONE); // "(11) 98765-4321"
```

### `validarFormulario.js`

Validações que retornam `boolean`.

| Export | Regra |
|---|---|
| `campoPreenchido(valor)` | não vazio (ignora espaços) |
| `emailValido(email)` | formato de e-mail |
| `senhaForte(senha)` | mínimo de 8 caracteres |
| `telefoneValido(telefone)` | 10 ou 11 dígitos (aceita máscara) |
| `senhasIguais(senha, confirmacao)` | iguais e não vazias |

```js
import { emailValido, senhaForte } from "../../utils/validarFormulario";
```

---

## 📜 Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | ambiente de desenvolvimento com HMR |
| `npm run build` | build de produção |
| `npm run preview` | pré-visualiza o build |
| `npm run lint` | roda o ESLint |
