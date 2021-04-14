/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  // TODO
  return (
    <>
      <Link href="/">
        <a>
          <Header />
        </a>
      </Link>

      <img className={styles.banner} src={post.data.banner.url} alt="banner" />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={commonStyles.info}>
            <FiCalendar size="1.25rem" />
            <time>{post.first_publication_date}</time>
            <FiUser size="1.25rem" />
            <span>{post.data.author}</span>
            <FiClock size="1.25rem" />
            <span>5 min</span>
          </div>

          {post.data.content.map(content => (
            <div className={styles.postContent}>
              <h2
                key={content.heading}
                className={styles.postHeading}
                dangerouslySetInnerHTML={{ __html: content.heading }}
              />

              <div
                className={styles.postBody}
                dangerouslySetInnerHTML={{ __html: String(content.body) }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  // TODO
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  // TODO
  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );

  const formattedContent = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: RichText.asHtml(content.body),
    };
  });

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'MM LLL yyyy',
      {
        locale: ptBr,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: formattedContent,
    },
  };

  // console.log(JSON.stringify(post.data.content, null, 2));

  return {
    props: {
      post,
    },
  };
};
