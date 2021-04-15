/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
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
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const postText = post.data.content.map(text => {
    return {
      heading: text.heading,
      body: RichText.asText(text.body),
    };
  });

  const totalWords = postText.reduce((accum, curr) => {
    return (
      accum + (curr.heading.split(/\s/g).length + curr.body.split(/\s/g).length)
    );
  }, 0);

  const timeReading = Math.ceil(totalWords / 200);

  return (
    <>
      <Header />

      <img className={styles.banner} src={post.data.banner.url} alt="banner" />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={commonStyles.info}>
            <FiCalendar size="1.25rem" />
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM uuuu', {
                locale: ptBr,
              })}
            </time>
            <FiUser size="1.25rem" />
            <span>{post.data.author}</span>
            <FiClock size="1.25rem" />
            <span>{`${timeReading} min`}</span>
          </div>

          {post.data.content.map(content => (
            <div className={styles.postContent} key={content.heading}>
              <h2
                key={content.heading}
                className={styles.postHeading}
                dangerouslySetInnerHTML={{ __html: content.heading }}
              />

              <div
                className={styles.postBody}
                dangerouslySetInnerHTML={{
                  __html: String(RichText.asHtml(content.body)),
                }}
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
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {}
  );

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
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

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};
